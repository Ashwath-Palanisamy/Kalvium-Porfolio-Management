import express from "express";
import { supabaseAdmin } from "../config/supabase.js";

const router = express.Router();

// ============================================================
// CONFIG
// ============================================================

const delay = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const getRandomDelay = (min = 1500, max = 3000) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const MAX_RETRIES = 3;

const LEETCODE_GRAPHQL_URL =
  "https://leetcode.com/graphql";

// Less than 2 minutes = potentially suspicious
const RAPID_SOLVE_SECONDS = 120;

// ============================================================
// VALIDATE LEETCODE USERNAME
// ============================================================

const isValidLeetCodeUsername = (username) =>
  /^[a-zA-Z0-9_-]{1,30}$/.test(username);

// ============================================================
// EXTRACT LEETCODE USERNAME
// ============================================================

const extractUsername = (input) => {
  if (!input) return null;

  const cleanInput = input
    .trim()
    .split("?")[0]
    .split("#")[0];

  try {
    if (cleanInput.includes("leetcode.com")) {
      const match = cleanInput.match(
        /leetcode\.com\/(?:u\/)?([^/]+)/
      );

      return (
        match?.[1]?.replace(/\/$/, "") || null
      );
    }

    return cleanInput.replace(/\/$/, "");
  } catch (error) {
    console.error(
      "[USERNAME EXTRACTION ERROR]",
      {
        input,
        message: error.message,
      }
    );

    return null;
  }
};

// ============================================================
// SUPABASE ERROR LOGGER
// ============================================================

const logSupabaseError = (
  context,
  error,
  extra = {}
) => {
  console.error("\n[SUPABASE ERROR]");
  console.error(`Context : ${context}`);

  console.error(
    JSON.stringify(
      {
        ...extra,
        code: error?.code,
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
      },
      null,
      2
    )
  );

  console.error(
    "-----------------------------------------------"
  );
};

// ============================================================
// MENTOR REVIEW QUEUE
// 3. NOTIFY MENTORS VIA BREVO REST API (CATEGORIZED BY INACTIVITY & UNSET PROFILES)
// ============================================================

router.get("/queue", async (req, res) => {
  try {
    console.log(
      "[MENTOR REVIEW] Fetching pending submissions..."
    );

    // ========================================================
    // 1. GET PENDING SUBMISSIONS
    // ========================================================

    const {
      data: submissions,
      error: submissionError,
    } = await supabaseAdmin
      .from("leetcode_submissions")
      .select(`
        id,
        user_id,
        leetcode_username,
        submission_id,
        title_slug,
        difficulty,
        submitted_at,
        status,
        flag_reason,
        review_status,
        created_at
      `)
      .eq("review_status", "pending")
      .order("submitted_at", {
        ascending: false,
      });

    if (submissionError) {
      logSupabaseError(
        "Fetching pending submissions",
        submissionError
      );

      return res.status(500).json({
        error:
          "Failed to fetch mentor review queue",
      });
    }

    // No pending reviews
    if (
      !submissions ||
      submissions.length === 0
    ) {
      return res.status(200).json({
        reviews: [],
      });
    }

    // ========================================================
    // 2. GET UNIQUE STUDENT IDS
    // ========================================================

    const studentIds = [
      ...new Set(
        submissions.map(
          (submission) => submission.user_id
        )
      ),
    ];

    // ========================================================
    // 3. GET PROFILES
    // ========================================================

    const {
      data: profiles,
      error: profileError,
    } = await supabaseAdmin
      .from("profiles")
      .select(`
        user_id,
        name,
        avatar_url
      `)
      .in("user_id", studentIds);

    if (profileError) {
      logSupabaseError(
        "Fetching student profiles",
        profileError
      );

      return res.status(500).json({
        error:
          "Failed to fetch student profiles",
      });
    }

    // ========================================================
    // 4. CREATE PROFILE MAP
    // ========================================================

    const profileMap = {};

    for (const profile of profiles || []) {
      profileMap[profile.user_id] = profile;
    }

    // ========================================================
    // 5. GET SQUAD INFORMATION
    // ========================================================

    const {
      data: squadStudents,
      error: squadError,
    } = await supabaseAdmin
      .from("squad_students")
      .select(`
        student_user_id,
        squad_id
      `)
      .in("student_user_id", studentIds);

    if (squadError) {
      logSupabaseError(
        "Fetching student squads",
        squadError
      );

      return res.status(500).json({
        error:
          "Failed to fetch student squads",
      });
    }

    // ========================================================
    // 6. CREATE SQUAD MAP
    // ========================================================

    const squadMap = {};

    for (const squad of squadStudents || []) {
      squadMap[squad.student_user_id] =
        squad.squad_id;
    }

    // ========================================================
    // 7. GET LEETCODE LEADERBOARD DATA
    // ========================================================

    const {
      data: leaderboardRecords,
      error: leaderboardError,
    } = await supabaseAdmin
      .from("leetcode_leaderboard")
      .select(`
        user_id,
        easy_solved,
        medium_solved,
        hard_solved,
        total_solved,
        score,
        ranking,
        leetcode_username
      `)
      .in("user_id", studentIds);

    if (leaderboardError) {
      logSupabaseError(
        "Fetching leaderboard data",
        leaderboardError
      );

      return res.status(500).json({
        error:
          "Failed to fetch leaderboard data",
      });
    }

    // ========================================================
    // 8. CREATE LEADERBOARD MAP
    // ========================================================

    const leaderboardMap = {};

    for (
      const leaderboard of leaderboardRecords || []
    ) {
      leaderboardMap[leaderboard.user_id] =
        leaderboard;
    }

    // ========================================================
    // 9. GROUP SUBMISSIONS BY STUDENT
    // ========================================================

    const studentMap = {};

    for (const submission of submissions) {
      const userId = submission.user_id;

      const profile = profileMap[userId];

      const leaderboard =
        leaderboardMap[userId];

      if (!studentMap[userId]) {
        studentMap[userId] = {
          student_user_id: userId,

          name:
            profile?.name ||
            "Student",

          avatar_url:
            profile?.avatar_url ||
            null,

          squad_id:
            squadMap[userId] ||
            null,

          leetcode_username:
            leaderboard?.leetcode_username ||
            submission.leetcode_username ||
            "unknown",

          // ==============================================
          // LEETCODE STATS
          // ==============================================

          easy_solved:
            leaderboard?.easy_solved ||
            0,

          medium_solved:
            leaderboard?.medium_solved ||
            0,

          hard_solved:
            leaderboard?.hard_solved ||
            0,

          total_solved:
            leaderboard?.total_solved ||
            0,

          score:
            leaderboard?.score ||
            0,

          ranking:
            leaderboard?.ranking ||
            0,

          // ==============================================
          // REVIEW DATA
          // ==============================================

          pending_review_count: 0,

          submissions: [],
        };
      }

      studentMap[userId]
        .pending_review_count++;

      studentMap[userId].submissions.push({
        id: submission.id,

        submission_id:
          submission.submission_id,

        title_slug:
          submission.title_slug,

        difficulty:
          submission.difficulty,

        submitted_at:
          submission.submitted_at,

        status:
          submission.status,

        flag_reason:
          submission.flag_reason,

        review_status:
          submission.review_status,

        created_at:
          submission.created_at,
      });
    }

    // ========================================================
    // 10. FINAL RESPONSE
    // ========================================================

    const reviews =
      Object.values(studentMap);

    console.log(
      `[MENTOR REVIEW] ${reviews.length} students pending`
    );

    return res.status(200).json({
      reviews,
    });
  } catch (error) {
    console.error(
      "[MENTOR REVIEW QUEUE EXCEPTION]",
      error
    );

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

// ============================================================
// APPROVE MENTOR REVIEW
// ============================================================

router.patch(
  "/:studentUserId/approve",
  async (req, res) => {
    const { studentUserId } =
      req.params;

    if (!studentUserId) {
      return res.status(400).json({
        error:
          "Student user ID is required",
      });
    }

    try {
      console.log(
        `[MENTOR REVIEW] Approving pending submissions for ${studentUserId}`
      );

      const {
        data,
        error,
      } = await supabaseAdmin
        .from("leetcode_submissions")
        .update({
          review_status: "approved",

          status: "APPROVED",

          flag_reason: null,
        })
        .eq("user_id", studentUserId)
        .eq("review_status", "pending")
        .select();

      if (error) {
        logSupabaseError(
          "Approving mentor review",
          error,
          {
            studentUserId,
          }
        );

        return res.status(500).json({
          error:
            "Failed to approve submissions",
        });
      }

      console.log(
        `[MENTOR REVIEW] Approved ${
          data?.length || 0
        } submissions`
      );

      return res.status(200).json({
        message:
          "Submissions approved successfully",

        updatedCount:
          data?.length || 0,

        reviews: data || [],
      });
    } catch (error) {
      console.error(
        "[APPROVE REVIEW EXCEPTION]",
        error
      );

      return res.status(500).json({
        error:
          "Internal server error",
      });
    }
  }
);

// ============================================================
// REJECT MENTOR REVIEW
// ============================================================

router.patch(
  "/:studentUserId/reject",
  async (req, res) => {
    const { studentUserId } =
      req.params;

    if (!studentUserId) {
      return res.status(400).json({
        error:
          "Student user ID is required",
      });
    }

    try {
      console.log(
        `[MENTOR REVIEW] Rejecting pending submissions for ${studentUserId}`
      );

      const {
        data,
        error,
      } = await supabaseAdmin
        .from("leetcode_submissions")
        .update({
          review_status: "rejected",

          status: "REJECTED",
        })
        .eq("user_id", studentUserId)
        .eq("review_status", "pending")
        .select();

      if (error) {
        logSupabaseError(
          "Rejecting mentor review",
          error,
          {
            studentUserId,
          }
        );

        return res.status(500).json({
          error:
            "Failed to reject submissions",
        });
      }

      console.log(
        `[MENTOR REVIEW] Rejected ${
          data?.length || 0
        } submissions`
      );

      return res.status(200).json({
        message:
          "Submissions rejected successfully",

        updatedCount:
          data?.length || 0,

        reviews: data || [],
      });
    } catch (error) {
      console.error(
        "[REJECT REVIEW EXCEPTION]",
        error
      );

      return res.status(500).json({
        error:
          "Internal server error",
      });
    }
  }
);

// ============================================================
// DETECT RAPID SUBMISSIONS
// ============================================================

function findRapidSubmissionIds(
  submissions
) {
  const rapidIds = new Set();

  if (
    !submissions ||
    submissions.length < 2
  ) {
    return rapidIds;
  }

  const sorted = [...submissions]
    .filter(
      (submission) =>
        submission?.id &&
        submission?.timestamp
    )
    .sort(
      (a, b) =>
        Number(a.timestamp) -
        Number(b.timestamp)
    );

  for (
    let i = 1;
    i < sorted.length;
    i++
  ) {
    const previous =
      Number(
        sorted[i - 1].timestamp
      );

    const current =
      Number(
        sorted[i].timestamp
      );

    const difference =
      current - previous;

    if (
      difference >= 0 &&
      difference < RAPID_SOLVE_SECONDS
    ) {
      const previousId =
        String(
          sorted[i - 1].id
        );

      const currentId =
        String(sorted[i].id);

      // Flag BOTH submissions
      rapidIds.add(previousId);
      rapidIds.add(currentId);

      console.log(
        `[RAPID SOLVE DETECTED] ${
          sorted[i - 1].titleSlug
        } <-> ${
          sorted[i].titleSlug
        } | ${difference}s apart`
      );
    }
  }

  return rapidIds;
}

// ============================================================
// SAVE LEETCODE SUBMISSIONS
// ============================================================

async function saveLeetCodeSubmissions(
  userId,
  username,
  recentSubmissions
) {
  if (
    !recentSubmissions ||
    recentSubmissions.length === 0
  ) {
    console.log(
      `[SUBMISSIONS] ${username} | No accepted submissions found`
    );

    return;
  }

  console.log(
    `[SUBMISSIONS] ${username} | Found ${recentSubmissions.length} accepted submissions`
  );

  // ========================================================
  // CLEAN + SORT
  // ========================================================

  const validSubmissions =
    recentSubmissions
      .filter(
        (submission) =>
          submission?.id &&
          submission?.timestamp
      )
      .sort(
        (a, b) =>
          Number(a.timestamp) -
          Number(b.timestamp)
      );

  // ========================================================
  // DETECT RAPID SUBMISSIONS
  // ========================================================

  const rapidSubmissionIds =
    findRapidSubmissionIds(
      validSubmissions
    );

  console.log(
    `[RAPID CHECK] ${username} | ${rapidSubmissionIds.size} submissions flagged`
  );

  // ========================================================
  // GET EXISTING DATABASE RECORDS
  // ========================================================

  const submissionIds =
    validSubmissions.map(
      (submission) =>
        String(submission.id)
    );

  const {
    data: existingRecords,
    error: existingError,
  } = await supabaseAdmin
    .from("leetcode_submissions")
    .select(`
      submission_id,
      review_status,
      status,
      flag_reason
    `)
    .in(
      "submission_id",
      submissionIds
    );

  if (existingError) {
    logSupabaseError(
      "Fetching existing submissions",
      existingError,
      {
        username,
      }
    );

    return;
  }

  // ========================================================
  // MAP EXISTING RECORDS
  // ========================================================

  const existingMap = {};

  for (
    const record of
      existingRecords || []
  ) {
    existingMap[
      String(
        record.submission_id
      )
    ] = record;
  }

  // ========================================================
  // BUILD RECORDS
  // ========================================================

  const submissionRecords =
    validSubmissions.map(
      (submission) => {
        const submissionId =
          String(
            submission.id
          );

        const existing =
          existingMap[
            submissionId
          ];

        const isRapid =
          rapidSubmissionIds.has(
            submissionId
          );

        let reviewStatus;
        let status;
        let flagReason;

        // ==================================================
        // 1. EXISTING APPROVED
        // ==================================================

        if (
          existing?.review_status ===
          "approved"
        ) {
          reviewStatus =
            "approved";

          status =
            "APPROVED";

          flagReason = null;

          console.log(
            `[SUBMISSION PRESERVED] ${username} | ${submissionId} | Mentor approved`
          );
        }

        // ==================================================
        // 2. EXISTING REJECTED
        // ==================================================

        else if (
          existing?.review_status ===
          "rejected"
        ) {
          reviewStatus =
            "rejected";

          status =
            "REJECTED";

          flagReason =
            existing.flag_reason ||
            "Rejected by mentor";

          console.log(
            `[SUBMISSION PRESERVED] ${username} | ${submissionId} | Mentor rejected`
          );
        }

        // ==================================================
        // 3. EXISTING PENDING
        // ==================================================

        else if (
          existing?.review_status ===
          "pending"
        ) {
          reviewStatus =
            "pending";

          status =
            "PENDING";

          flagReason =
            existing.flag_reason ||
            "Rapid consecutive solve (< 2 minutes)";

          console.log(
            `[SUBMISSION PRESERVED] ${username} | ${submissionId} | Still pending`
          );
        }

        // ==================================================
        // 4. NEW RAPID SUBMISSION
        // ==================================================

        else if (isRapid) {
          reviewStatus =
            "pending";

          status =
            "PENDING";

          flagReason =
            "Rapid consecutive solve (< 2 minutes)";

          console.log(
            `[MENTOR REVIEW FLAG] ${username} | ${submissionId} | ${flagReason}`
          );
        }

        // ==================================================
        // 5. NEW NORMAL SUBMISSION
        // ==================================================

        else {
          reviewStatus =
            "approved";

          status =
            "APPROVED";

          flagReason = null;

          console.log(
            `[NORMAL SUBMISSION] ${username} | ${submissionId} | Automatically approved`
          );
        }

        return {
          user_id: userId,

          leetcode_username:
            username,

          submission_id:
            submissionId,

          title_slug:
            submission.titleSlug,

          difficulty:
            null,

          submitted_at:
            new Date(
              Number(
                submission.timestamp
              ) * 1000
            ).toISOString(),

          review_status:
            reviewStatus,

          status,

          flag_reason:
            flagReason,
        };
      }
    );

  // ========================================================
  // UPSERT
  // ========================================================

  const {
    data,
    error,
  } = await supabaseAdmin
    .from("leetcode_submissions")
    .upsert(
      submissionRecords,
      {
        onConflict:
          "submission_id",

        ignoreDuplicates:
          false,
      }
    )
    .select();

  if (error) {
    logSupabaseError(
      `Submission save failed for ${username}`,
      error,
      {
        userId,
        username,
        submissionCount:
          submissionRecords.length,
      }
    );

    return;
  }

  // ========================================================
  // LOG SUMMARY
  // ========================================================

  const pendingCount =
    submissionRecords.filter(
      (record) =>
        record.review_status ===
        "pending"
    ).length;

  const approvedCount =
    submissionRecords.filter(
      (record) =>
        record.review_status ===
        "approved"
    ).length;

  const rejectedCount =
    submissionRecords.filter(
      (record) =>
        record.review_status ===
        "rejected"
    ).length;

  console.log(
    `[SUBMISSIONS SAVED] ${username} | ${
      data?.length || 0
    } records`
  );

  console.log(
    `   Pending  : ${pendingCount}`
  );

  console.log(
    `   Approved : ${approvedCount}`
  );

  console.log(
    `   Rejected : ${rejectedCount}`
  );
}

// ============================================================
// NOTIFY MENTORS ABOUT INACTIVE STUDENTS
// ============================================================

async function notifyMentorsAboutInactiveStudents() {
  console.log(
    "\n[EMAIL SYSTEM] Starting inactive student notifications..."
  );

  try {
    // ========================================================
    // GET INACTIVE STUDENTS
    // ========================================================

    const {
      data: inactiveRecords,
      error: inactiveError,
    } = await supabaseAdmin
      .from("leetcode_leaderboard")
      .select(`
        user_id,
        last_solved_at,
        profiles!inner (
          name,
          kalvium_email
        )
      `)
      .eq(
        "is_leetcode_active",
        false
      );

    if (inactiveError) {
      throw inactiveError;
    }

    if (
      !inactiveRecords ||
      inactiveRecords.length === 0
    ) {
      console.log(
        "[EMAIL SYSTEM] No inactive students found."
      );

      return;
    }
    console.log("\n [EMAIL SYSTEM] Starting inactive student notifications via Brevo API...");

    try {
        // Step 1: Fetch inactive students from leaderboard (is_leetcode_active = false)
        const { data: inactiveRecords, error: inactiveError } = await supabaseAdmin
            .from("leetcode_leaderboard")
            .select(`
                user_id,
                last_solved_at,
                profiles!inner (
                    name,
                    kalvium_email
                )
            `)
            .eq("is_leetcode_active", false);

        if (inactiveError) throw inactiveError;

    // ========================================================
    // GET ASSIGNMENTS
    // ========================================================

    const {
      data: assignments,
      error: assignmentError,
    } = await supabaseAdmin
      .from("squad_students")
      .select(
        "student_user_id, mentor_user_id"
      );

    if (assignmentError) {
      throw assignmentError;
    }
        if (assignmentError) {
            console.error("[EMAIL SYSTEM ERROR] Failed to fetch assignments.");
            throw assignmentError;
        }

        if (!assignments || assignments.length === 0) {
            console.log("[EMAIL SYSTEM] No mentor-student assignments found.");
            return;
        }

    // ========================================================
    // STUDENT -> MENTORS
    // ========================================================

    const studentToMentorsMap = {};

    for (
      const assignment of
        assignments || []
    ) {
      if (
        !studentToMentorsMap[
          assignment.student_user_id
        ]
      ) {
        studentToMentorsMap[
          assignment.student_user_id
        ] = [];
      }

      studentToMentorsMap[
        assignment.student_user_id
      ].push(
        assignment.mentor_user_id
      );
    }

    // ========================================================
    // GET MENTOR IDS
    // ========================================================

    const mentorIds =
      new Set();

    for (
      const record of
        inactiveRecords
    ) {
      const mentors =
        studentToMentorsMap[
          record.user_id
        ] || [];

      for (
        const mentorId of mentors
      ) {
        mentorIds.add(
          mentorId
        );
      }
    }

    if (
      mentorIds.size === 0
    ) {
      console.log(
        "[EMAIL SYSTEM] No inactive students mapped to mentors."
      );

      return;
    }

    // ========================================================
    // GET MENTOR PROFILES
    // ========================================================

    const {
      data: mentorProfiles,
      error: mentorError,
    } = await supabaseAdmin
      .from("profiles")
      .select(
        "user_id, name, kalvium_email"
      )
      .in(
        "user_id",
        Array.from(mentorIds)
      );

    if (mentorError) {
      throw mentorError;
    }
        // Step 3: Map students to mentors (Supports MULTIPLE mentors per student)
        const studentToMentorsMap = {};
        const allAssignedStudentUserIds = new Set();

        assignments.forEach((assignment) => {
            if (!studentToMentorsMap[assignment.student_user_id]) {
                studentToMentorsMap[assignment.student_user_id] = [];
            }
            studentToMentorsMap[assignment.student_user_id].push(assignment.mentor_user_id);
            allAssignedStudentUserIds.add(assignment.student_user_id);
        });

        // Step 4: Identify assigned students who haven't set their LeetCode profile URL
        console.log("[EMAIL SYSTEM] Checking for students with unset LeetCode profiles...");
        const { data: allStudentProfiles, error: profilesError } = await supabaseAdmin
            .from("profiles")
            .select("user_id, name, kalvium_email, leetcode")
            .in("user_id", Array.from(allAssignedStudentUserIds));

        if (profilesError) throw profilesError;

        const missingProfileStudents = (allStudentProfiles || []).filter(
            (p) => !p.leetcode || p.leetcode.trim() === ""
        );

        // Step 5: Figure out which Mentors we need to email
        const activeMentorIdsToFetch = new Set();

        // Add mentors of inactive leaderboard students
        (inactiveRecords || []).forEach((record) => {
            const mentorIds = studentToMentorsMap[record.user_id] || [];
            mentorIds.forEach((mId) => activeMentorIdsToFetch.add(mId));
        });

        // Add mentors of students without LeetCode profile
        missingProfileStudents.forEach((studentProfile) => {
            const mentorIds = studentToMentorsMap[studentProfile.user_id] || [];
            mentorIds.forEach((mId) => activeMentorIdsToFetch.add(mId));
        });

        if (activeMentorIdsToFetch.size === 0) {
            console.log("[EMAIL SYSTEM] No inactive or profile-missing students mapped to mentors today.");
            return;
        }

        // Step 6: Fetch mentor details directly from Supabase Auth & Profiles
        const mentorProfiles = await Promise.all(
            Array.from(activeMentorIdsToFetch).map(async (mentorId) => {
                const [{ data: authUserData }, { data: profile }] = await Promise.all([
                    supabaseAdmin.auth.admin.getUserById(mentorId),
                    supabaseAdmin.from("profiles").select("name").eq("user_id", mentorId).maybeSingle(),
                ]);

                const authUser = authUserData?.user;

                return {
                    user_id: mentorId,
                    name: profile?.name || authUser?.user_metadata?.full_name || "Mentor",
                    email: authUser?.email || null,
                };
            })
        );

    const mentorDataMap = {};

    for (
      const mentor of
        mentorProfiles || []
    ) {
      mentorDataMap[
        mentor.user_id
      ] = mentor;
    }

    // ========================================================
    // GROUP STUDENTS
    // ========================================================

    const groupedByMentor = {};

    const nowMs =
      Date.now();

    const ONE_DAY_MS =
      24 *
      60 *
      60 *
      1000;

    for (
      const record of
        inactiveRecords
    ) {
      const assignedMentors =
        studentToMentorsMap[
          record.user_id
        ] || [];

      const lastSolvedDate =
        record.last_solved_at
          ? new Date(
              record.last_solved_at
            )
          : null;

      const daysInactive =
        lastSolvedDate
          ? Math.floor(
              (nowMs -
                lastSolvedDate.getTime()) /
                ONE_DAY_MS
            )
          : null;
        const mentorDataMap = {};
        mentorProfiles.forEach((mentor) => {
            if (mentor.user_id && mentor.email) {
                mentorDataMap[mentor.user_id] = mentor;
            }
        });

        // Step 7: Group students under ALL assigned mentors (7+ days, 1-6 days, Profile Not Set)
        const groupedByMentor = {};
        const nowMs = Date.now();
        const ONE_DAY_MS = 24 * 60 * 60 * 1000;

        // Group Inactive Students
        (inactiveRecords || []).forEach((record) => {
            const mentorUserIds = studentToMentorsMap[record.user_id] || [];
            if (mentorUserIds.length === 0) return;

            const lastSolvedDate = record.last_solved_at ? new Date(record.last_solved_at) : null;
            const daysInactive = lastSolvedDate
                ? Math.floor((nowMs - lastSolvedDate.getTime()) / ONE_DAY_MS)
                : null;

      const student = {
        name:
          record.profiles
            ?.name ||
          "Student",

        email:
          record.profiles
            ?.kalvium_email ||
          "Unknown",

        lastSolved:
          lastSolvedDate
            ? lastSolvedDate.toLocaleDateString()
            : "Never / Unknown",

        daysInactive:
          daysInactive !== null
            ? daysInactive
            : "Unknown",
      };

      for (
        const mentorId of
          assignedMentors
      ) {
        const mentor =
          mentorDataMap[
            mentorId
          ];

        if (
          !mentor ||
          !mentor.kalvium_email
        ) {
          continue;
        }

        if (
          !groupedByMentor[
            mentor.kalvium_email
          ]
        ) {
          groupedByMentor[
            mentor.kalvium_email
          ] = {
            mentorName:
              mentor.name ||
              "Mentor",

            sevenDaysPlus:
              [],

            oneToSixDays:
              [],
          };
        }

        if (
          daysInactive ===
            null ||
          daysInactive >= 7
        ) {
          groupedByMentor[
            mentor.kalvium_email
          ].sevenDaysPlus.push(
            student
          );
        } else {
          groupedByMentor[
            mentor.kalvium_email
          ].oneToSixDays.push(
            student
          );
        }
      }
    }

    // ========================================================
    // SEND EMAILS
    // ========================================================

    for (
      const [
        mentorEmail,
        data,
      ] of Object.entries(
        groupedByMentor
      )
    ) {
      const recipientEmail =
        mentorEmail;
            mentorUserIds.forEach((mentorUserId) => {
                const mentor = mentorDataMap[mentorUserId];
                if (!mentor || !mentor.email) return;

                if (!groupedByMentor[mentor.email]) {
                    groupedByMentor[mentor.email] = {
                        mentorName: mentor.name || "Mentor",
                        sevenDaysPlus: [],
                        oneToSixDays: [],
                        missingProfile: [],
                    };
                }

                if (daysInactive === null || daysInactive >= 7) {
                    groupedByMentor[mentor.email].sevenDaysPlus.push(student);
                } else {
                    groupedByMentor[mentor.email].oneToSixDays.push(student);
                }
            });
        });

        // Group Missing Profile Students
        missingProfileStudents.forEach((studentProfile) => {
            const mentorUserIds = studentToMentorsMap[studentProfile.user_id] || [];
            if (mentorUserIds.length === 0) return;

            const student = {
                name: studentProfile.name || "Unknown Student",
                email: studentProfile.kalvium_email || "No Email",
            };

            mentorUserIds.forEach((mentorUserId) => {
                const mentor = mentorDataMap[mentorUserId];
                if (!mentor || !mentor.email) return;

                if (!groupedByMentor[mentor.email]) {
                    groupedByMentor[mentor.email] = {
                        mentorName: mentor.name || "Mentor",
                        sevenDaysPlus: [],
                        oneToSixDays: [],
                        missingProfile: [],
                    };
                }

                groupedByMentor[mentor.email].missingProfile.push(student);
            });
        });

        // Step 8: Send categorized email reports via Brevo REST API
        for (const [mentorEmail, data] of Object.entries(groupedByMentor)) {
            const recipientEmail = testemail && testemail.trim() !== "" ? testemail : mentorEmail;

      const renderList = (
        students
      ) =>
        students
          .map(
            (student) => `
              <li>
                <strong>
                  ${student.name}
                </strong>
                (${student.email})
                — Last active:
                ${student.lastSolved}
                (${student.daysInactive}
                days inactive)
              </li>
            `
          )
          .join("");

      const sevenDaysHtml =
        data.sevenDaysPlus.length
          ? `<ul>${renderList(
              data.sevenDaysPlus
            )}</ul>`
          : `
              <p>
                <em>
                  No students inactive
                  for 7+ days.
                </em>
              </p>
            `;

      const oneToSixDaysHtml =
        data.oneToSixDays.length
          ? `<ul>${renderList(
              data.oneToSixDays
            )}</ul>`
          : `
              <p>
                <em>
                  No students inactive
                  in the 1–6 day window.
                </em>
              </p>
            `;

      const totalCount =
        data.sevenDaysPlus
          .length +
        data.oneToSixDays
          .length;
            const renderMissingList = (students) =>
                students
                    .map((s) => `<li><strong>${s.name}</strong> (${s.email}) — <em>Profile URL not set in portal</em></li>`)
                    .join("");

            const sevenDaysHtml = data.sevenDaysPlus.length
                ? `<ul>${renderList(data.sevenDaysPlus)}</ul>`
                : `<p><em>No students inactive for 7+ days.</em></p>`;

            const oneToSixDaysHtml = data.oneToSixDays.length
                ? `<ul>${renderList(data.oneToSixDays)}</ul>`
                : `<p><em>No students inactive in the 1–6 day window.</em></p>`;

            const missingProfileHtml = data.missingProfile.length
                ? `<ul>${renderMissingList(data.missingProfile)}</ul>`
                : `<p><em>All assigned squad members have configured their LeetCode profiles.</em></p>`;

            const totalCount =
                data.sevenDaysPlus.length + data.oneToSixDays.length + data.missingProfile.length;

            if (totalCount === 0) continue;

      const response =
        await fetch(
          "https://api.brevo.com/v3/smtp/email",
          {
            method: "POST",

            headers: {
              accept:
                "application/json",

              "content-type":
                "application/json",

              "api-key":
                process.env
                  .BREVO_API_KEY,
            },

            body: JSON.stringify({
              sender: {
                name:
                  "Kalvium Portfolio Management",

                email:
                  "kpm-squad@googlegroups.com",
              },

              to: [
                {
                  email:
                    recipientEmail,

                  name:
                    data.mentorName,
                },
              ],

              subject:
                "[KPM Report] - Daily Report: Squad(s) LeetCode Inactivity Summary",

              htmlContent: `
                <h3>
                  Hello ${data.mentorName},
                </h3>

                <p>
                  Here is the daily
                  LeetCode inactivity
                  report for your
                  squad(s):
                </p>

                <h4>
                  High Priority:
                  Inactive for 7+ Days
                  (${data.sevenDaysPlus.length})
                </h4>

                ${sevenDaysHtml}
            const response = await fetch("https://api.brevo.com/v3/smtp/email", {
                method: "POST",
                headers: {
                    accept: "application/json",
                    "content-type": "application/json",
                    "api-key": process.env.BREVO_API_KEY,
                },
                body: JSON.stringify({
                    sender: {
                        name: "Kalvium Portfolio Management",
                        email: "kpm-squad@googlegroups.com",
                    },
                    to: [{ email: recipientEmail, name: data.mentorName }],
                    subject: `[KPM Report] - Daily Report: Squad(s) LeetCode Inactivity & Setup Summary`,
                    htmlContent: `
                        <h3>Hello ${data.mentorName},</h3>
                        <p>Here is the daily LeetCode inactivity & profile setup report for your squad(s):</p>
                        
                        <h4 style="color: #d9534f;">🚨 High Priority: Inactive for 7+ Days (${data.sevenDaysPlus.length})</h4>
                        ${sevenDaysHtml}

                <h4>
                  Warning:
                  Inactive for 1–6 Days
                  (${data.oneToSixDays.length})
                </h4>

                ${oneToSixDaysHtml}
                        <h4 style="color: #f0ad4e;">⚠️ Warning: Inactive for 1–6 Days (${data.oneToSixDays.length})</h4>
                        ${oneToSixDaysHtml}

                        <h4 style="color: #6c757d;">📝 Action Required: LeetCode Profile Not Set (${data.missingProfile.length})</h4>
                        ${missingProfileHtml}

                <p>
                  Please reach out
                  to your squad
                  members to keep
                  them on track.
                </p>
              `,
            }),
          }
        );

      if (!response.ok) {
        const errorData =
          await response.json();

        console.error(
          `[EMAIL ERROR] ${recipientEmail}`,
          errorData
        );
      } else {
        console.log(
          `[EMAIL SENT] ${data.mentorName} | ${recipientEmail} | ${totalCount} students`
        );
      }
    }
            if (!response.ok) {
                const errorData = await response.json();
                console.error(`[EMAIL ERROR] Brevo API failed for ${recipientEmail}:`, errorData);
            } else {
                console.log(`[EMAIL SENT] Notified mentor ${data.mentorName} (Recipient: ${recipientEmail}) about ${totalCount} student updates.`);
            }
        }

    console.log(
      "[EMAIL SYSTEM] Finished notifications."
    );
  } catch (error) {
    console.error(
      "[EMAIL SYSTEM ERROR]",
      error.message
    );
  }
        console.log("[EMAIL SYSTEM] Finished sending mentor notifications.");
    } catch (err) {
        console.error("[EMAIL SYSTEM ERROR] Failed to send mentor notifications:", err.message);
    }
}

// ============================================================
// SYNC ONE LEETCODE PROFILE
// ============================================================

async function syncSingleLeetCodeProfile(
  profileId,
  userId,
  rawLeetCodeUrl,
  maxRetries = MAX_RETRIES
) {
  const username =
    extractUsername(
      rawLeetCodeUrl
    );

  console.log(
    "\n┌──────────────────────────────────────────────"
  );

  console.log(
    "│ SYNC PROFILE"
  );

  console.log(
    "├──────────────────────────────────────────────"
  );

  console.log(
    `│ Profile ID : ${profileId}`
  );

  console.log(
    `│ User ID    : ${userId}`
  );

  console.log(
    `│ Raw URL    : ${rawLeetCodeUrl}`
  );

  console.log(
    `│ Username   : ${username}`
  );

  console.log(
    "└──────────────────────────────────────────────"
  );

  // ========================================================
  // VALIDATE USERNAME
  // ========================================================

  if (
    !username ||
    !isValidLeetCodeUsername(
      username
    )
  ) {
    console.warn(
      "[INVALID LEETCODE USERNAME]",
      {
        profileId,
        rawLeetCodeUrl,
        username,
      }
    );

    return {
      status:
        "INVALID_URL",

      username:
        username ||
        rawLeetCodeUrl,
    };
  }

  // ========================================================
  // GRAPHQL QUERY
  // ========================================================

  const query = `
    query getUserStats(
      $username: String!
    ) {
      matchedUser(
        username: $username
      ) {
        username

        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }

        profile {
          ranking
        }
      }

      recentAcSubmissionList(
        username: $username
        limit: 20
      ) {
        id
        title
        titleSlug
        timestamp
        lang
      }
    }
  `;

  // ========================================================
  // RETRY LOOP
  // ========================================================

  for (
    let attempt = 1;
    attempt <= maxRetries;
    attempt++
  ) {
    try {
      console.log(
        `[LEETCODE] ${username} | Request ${attempt}/${maxRetries}`
      );

      const response =
        await fetch(
          LEETCODE_GRAPHQL_URL,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Referer:
                "https://leetcode.com",

              "User-Agent":
                "Mozilla/5.0",
            },

            body: JSON.stringify({
              query,

              variables: {
                username,
              },
            }),
          }
        );

      console.log(
        `[LEETCODE RESPONSE] ${username} | HTTP ${response.status}`
      );

      // ====================================================
      // RATE LIMIT / SERVER ERROR
      // ====================================================

      if (
        response.status ===
          429 ||
        response.status >= 500
      ) {
        const backoffTime =
          attempt * 5000;

        console.warn(
          `[LEETCODE RETRY] ${username} | Waiting ${backoffTime}ms`
        );

        await delay(
          backoffTime
        );

        continue;
      }

      // ====================================================
      // HTTP ERROR
      // ====================================================

      if (!response.ok) {
        return {
          status:
            "HTTP_ERROR",

          username,

          httpCode:
            response.status,
        };
      }

      const result =
        await response.json();

      // ====================================================
      // GRAPHQL ERROR
      // ====================================================

      if (result.errors) {
        const errorMessage =
          result.errors[0]
            ?.message ||
          "Unknown GraphQL error";

        console.error(
          `[LEETCODE GRAPHQL ERROR] ${username}`,
          result.errors
        );

        const isRateLimited =
          result.errors.some(
            (error) =>
              error.message
                ?.toLowerCase()
                .includes(
                  "rate"
                ) ||
              error.message
                ?.toLowerCase()
                .includes(
                  "many requests"
                )
          );

        if (
          isRateLimited &&
          attempt < maxRetries
        ) {
          await delay(
            attempt * 5000
          );

          continue;
        }

        return {
          status:
            "GRAPHQL_ERROR",

          username,

          error:
            errorMessage,

          details:
            result.errors,
        };
      }

      // ====================================================
      // USER
      // ====================================================

      const matchedUser =
        result?.data
          ?.matchedUser;

      if (!matchedUser) {
        console.warn(
          `[LEETCODE USER NOT FOUND] ${username}`
        );

        return {
          status:
            "NOT_FOUND",

          username,
        };
      }

      // ====================================================
      // STATS
      // ====================================================

      const submitStats =
        matchedUser
          .submitStatsGlobal
          ?.acSubmissionNum ||
        [];

      const totalSolved =
        submitStats.find(
          (item) =>
            item.difficulty ===
            "All"
        )?.count || 0;

      const easySolved =
        submitStats.find(
          (item) =>
            item.difficulty ===
            "Easy"
        )?.count || 0;

      const mediumSolved =
        submitStats.find(
          (item) =>
            item.difficulty ===
            "Medium"
        )?.count || 0;

      const hardSolved =
        submitStats.find(
          (item) =>
            item.difficulty ===
            "Hard"
        )?.count || 0;

      const ranking =
        matchedUser.profile
          ?.ranking || 0;

      // Easy = 1
      // Medium = 1.5
      // Hard = 2

      const score =
        easySolved +
        mediumSolved * 1.5 +
        hardSolved * 2;

      console.log(
        "\n[LEETCODE STATS]"
      );

      console.log(
        `   Username : ${matchedUser.username}`
      );

      console.log(
        `   Total    : ${totalSolved}`
      );

      console.log(
        `   Easy     : ${easySolved}`
      );

      console.log(
        `   Medium   : ${mediumSolved}`
      );

      console.log(
        `   Hard     : ${hardSolved}`
      );

      console.log(
        `   Score    : ${score}`
      );

      // ====================================================
      // RECENT SUBMISSIONS
      // ====================================================

      const recentSubmissions =
        result?.data
          ?.recentAcSubmissionList ||
        [];

      let lastSolvedAt =
        null;

      if (
        recentSubmissions.length >
          0 &&
        recentSubmissions[0]
          ?.timestamp
      ) {
        const unixSec =
          Number(
            recentSubmissions[0]
              .timestamp
          );

        if (
          !Number.isNaN(
            unixSec
          ) &&
          unixSec > 0
        ) {
          lastSolvedAt =
            new Date(
              unixSec * 1000
            ).toISOString();
        }
      }

      // ====================================================
      // SAVE SUBMISSIONS
      // ====================================================

      await saveLeetCodeSubmissions(
        userId,
        matchedUser.username,
        recentSubmissions
      );

      // ====================================================
      // FALLBACK LAST SOLVED
      // ====================================================

      if (!lastSolvedAt) {
        console.log(
          `[DB LOOKUP] Checking existing last_solved_at for ${username}`
        );

        const {
          data: existingData,
          error: existingError,
        } = await supabaseAdmin
          .from(
            "leetcode_leaderboard"
          )
          .select(
            "last_solved_at"
          )
          .eq(
            "profile_id",
            profileId
          )
          .maybeSingle();

        if (existingError) {
          logSupabaseError(
            "Existing leaderboard lookup failed",
            existingError,
            {
              profileId,
              username,
            }
          );
        }

        lastSolvedAt =
          existingData
            ?.last_solved_at ||
          null;
      }

      // ====================================================
      // ACTIVE STATUS
      // ====================================================

      const ONE_DAY_MS =
        24 *
        60 *
        60 *
        1000;

      const isLeetCodeActive =
        lastSolvedAt
          ? Date.now() -
              new Date(
                lastSolvedAt
              ).getTime() <=
            ONE_DAY_MS
          : false;
                if (existingError) {
                    logSupabaseError(`Existing leaderboard lookup failed`, existingError, { profileId, username });
                }
                lastSolvedAt = existingData?.last_solved_at || null;
            }

            // --------------------------------------------------------
            // ACTIVE STATUS
            // --------------------------------------------------------

            const hasSolvedProblems = Number(totalSolved) > 0;
            const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

            const normalizedLastSolvedAt = hasSolvedProblems ? lastSolvedAt : null;
            const isLeetCodeActive =
                hasSolvedProblems && normalizedLastSolvedAt
                    ? Date.now() - new Date(normalizedLastSolvedAt).getTime() <= SEVEN_DAYS_MS
                    : false;

      // ====================================================
      // LEADERBOARD UPSERT
      // ====================================================

      const upsertPayload = {
        profile_id:
          profileId,

        user_id:
          userId,

        leetcode_username:
          matchedUser.username,

        easy_solved:
          easySolved,

        medium_solved:
          mediumSolved,

        hard_solved:
          hardSolved,

        total_solved:
          totalSolved,

        ranking,

        score,

        updated_at:
          new Date().toISOString(),

        last_solved_at:
          lastSolvedAt,

        is_leetcode_active:
          isLeetCodeActive,
      };
            const upsertPayload = {
                profile_id: profileId,
                user_id: userId,
                leetcode_username: matchedUser.username,
                easy_solved: easySolved,
                medium_solved: mediumSolved,
                hard_solved: hardSolved,
                total_solved: totalSolved,
                ranking,
                score,
                updated_at: new Date().toISOString(),
                last_solved_at: normalizedLastSolvedAt,
                is_leetcode_active: isLeetCodeActive,
            };

      console.log(
        `[DB UPSERT] ${username} | Updating leetcode_leaderboard...`
      );

      const {
        data: savedData,
        error: dbError,
      } = await supabaseAdmin
        .from(
          "leetcode_leaderboard"
        )
        .upsert(
          upsertPayload,
          {
            onConflict:
              "profile_id",
          }
        )
        .select()
        .single();

      if (dbError) {
        logSupabaseError(
          "Leaderboard upsert failed",
          dbError,
          {
            profileId,
            userId,
            username,
          }
        );

        if (
          attempt <
          maxRetries
        ) {
          await delay(
            2000
          );

          continue;
        }

        return {
          status:
            "DB_ERROR",

          username,

          error:
            dbError.message,
        };
      }

      console.log(
        `[DB SUCCESS] ${username} | Score: ${score}`
      );

      return {
        status:
          "SUCCESS",

        username:
          matchedUser.username,

        isActive:
          isLeetCodeActive,

        score,
      };
    } catch (error) {
      console.error(
        `[SYNC EXCEPTION] ${username}`,
        error.message
      );

      if (
        attempt <
        maxRetries
      ) {
        await delay(
          attempt * 3000
        );
      } else {
        return {
          status:
            "NETWORK_ERROR",

          username,

          error:
            error.message,
        };
      }
    }
  }
}

// ============================================================
// UPDATE LEADERBOARD
// ============================================================

router.post(
  "/update-leetcode",
  async (req, res) => {
    console.log(
      "\n============================================================"
    );

    console.log(
      "LEETCODE LEADERBOARD UPDATE STARTED"
    );

    console.log(
      "============================================================"
    );

    // ========================================================
    // AUTH
    // ========================================================

    const authHeader =
      req.headers.authorization;

    if (
      authHeader !==
      `Bearer ${process.env.CRON_SECRET}`
    ) {
      console.error(
        "[AUTH FAILED] Invalid CRON_SECRET"
      );

      return res.status(401).json({
        error:
          "Unauthorized",
      });
    }

    console.log(
      "[AUTH SUCCESS] Cron request authenticated."
    );

    // ========================================================
    // RESPOND IMMEDIATELY
    // ========================================================

    res.status(200).json({
      message:
        "Leaderboard update process started in background.",
    });

    // ========================================================
    // BACKGROUND PROCESS
    // ========================================================

    try {
      let users = null;

      let fetchError = null;

      // ======================================================
      // FETCH PROFILES
      // ======================================================

      for (
        let attempt = 1;
        attempt <= 3;
        attempt++
      ) {
        const {
          data,
          error,
        } = await supabaseAdmin
          .from("profiles")
          .select(
            "id, user_id, leetcode"
          )
          .not(
            "user_id",
            "is",
            null
          )
          .not(
            "leetcode",
            "is",
            null
          )
          .neq(
            "leetcode",
            ""
          );

        if (!error) {
          users = data;

          break;
        }

        fetchError =
          error;

        logSupabaseError(
          `Profiles fetch attempt ${attempt}`,
          error
        );

        await delay(
          2000
        );
      }

      if (!users) {
        console.error(
          "[CRON FATAL] Unable to fetch profiles."
        );

        console.error(
          fetchError
        );

        return;
      }

      console.log(
        `[PROFILE FETCH SUCCESS] Found ${users.length} profiles.`
      );

      // ======================================================
      // SYNC EVERY STUDENT
      // ======================================================

      for (
        let index = 0;
        index < users.length;
        index++
      ) {
        const user =
          users[index];

        console.log(
          `\n[SYNC PROGRESS] ${
            index + 1
          }/${users.length}`
        );

        await syncSingleLeetCodeProfile(
          user.id,
          user.user_id,
          user.leetcode
        );

        await delay(
          getRandomDelay()
        );
      }

      // ======================================================
      // SEND MENTOR EMAILS
      // ======================================================

      await notifyMentorsAboutInactiveStudents();

      console.log(
        `\nFinished: ${new Date().toISOString()}`
      );

      console.log(
        "============================================================"
      );
    } catch (error) {
      console.error(
        "\n[CRON FATAL EXCEPTION]"
      );

      console.error({
        message:
          error.message,

        stack:
          error.stack,
      });
    }
  }
);

// ============================================================
// EXPORT
// ============================================================

export default router;