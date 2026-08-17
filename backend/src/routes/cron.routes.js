import express from "express";
import { supabaseAdmin } from "../config/supabase.js";
import nodemailer from "nodemailer";

const testemail = process.env.TEST_EMAIL;
const router = express.Router();

// ============================================================
// CONFIG & CONSTANTS
// ============================================================

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getRandomDelay = (min = 1500, max = 3000) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const MAX_RETRIES = 3;

const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";

const isValidLeetCodeUsername = (username) =>
    /^[a-zA-Z0-9_-]{1,30}$/.test(username);

// ============================================================
// 2. BREVO SMTP TRANSPORTER CONFIGURATION
// ============================================================
const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false, 
    auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_KEY,
    },
});

// ============================================================
// HELPERS
// ============================================================

const extractUsername = (input) => {
    if (!input) return null;
    const cleanInput = input.trim().split("?")[0].split("#")[0];
    try {
        if (cleanInput.includes("leetcode.com")) {
            const match = cleanInput.match(/leetcode\.com\/(?:u\/)?([^/]+)/);
            return match?.[1]?.replace(/\/$/, "") || null;
        }
        return cleanInput.replace(/\/$/, "");
    } catch (error) {
        console.error("[USERNAME EXTRACTION ERROR]", { input, message: error.message });
        return null;
    }
};

const logSupabaseError = (context, error, extra = {}) => {
    console.error("\n[SUPABASE ERROR]");
    console.error(`Context : ${context}`);
    console.error(
        JSON.stringify(
            { ...extra, code: error?.code, message: error?.message, details: error?.details, hint: error?.hint },
            null, 2
        )
    );
    console.error("-----------------------------------------------");
};

// ============================================================
// 3. NOTIFY MENTORS ABOUT INACTIVE STUDENTS FUNCTION
// ============================================================
async function notifyMentorsAboutInactiveStudents() {
    console.log("\n [EMAIL SYSTEM] Starting inactive student notifications...");

    try {
        // Step 1: Fetch inactive students from leaderboard
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
        
        if (!inactiveRecords || inactiveRecords.length === 0) {
            console.log("[EMAIL SYSTEM] No inactive students found today.");
            return;
        }

        // Step 2: Fetch mentor-student assignments dynamically from Supabase
        console.log("[EMAIL SYSTEM] Fetching mentor assignments from database...");
        const { data: assignments, error: assignmentError } = await supabaseAdmin
            .from("squad_students")
            .select("student_user_id, mentor_user_id");

        if (assignmentError) {
            console.error("[EMAIL SYSTEM ERROR] Failed to fetch assignments.");
            throw assignmentError;
        }

        // Step 3: Map students to mentors
        const studentToMentorMap = {};
        assignments.forEach(assignment => {
            studentToMentorMap[assignment.student_user_id] = assignment.mentor_user_id;
        });

        // Step 4: Figure out which Mentors we need to email
        const activeMentorIdsToFetch = new Set();
        inactiveRecords.forEach(record => {
            const mentorId = studentToMentorMap[record.user_id];
            if (mentorId) {
                activeMentorIdsToFetch.add(mentorId);
            }
        });

        if (activeMentorIdsToFetch.size === 0) {
            console.log("[EMAIL SYSTEM] None of the inactive students are currently mapped to a mentor.");
            return;
        }

        // Step 5: Fetch mentor details securely using kalvium_email
        const { data: mentorProfiles, error: mentorError } = await supabaseAdmin
            .from("profiles")
            .select("user_id, name, kalvium_email")
            .in("user_id", Array.from(activeMentorIdsToFetch));

        if (mentorError) throw mentorError;

        const mentorDataMap = {};
        mentorProfiles.forEach(mentor => {
            mentorDataMap[mentor.user_id] = mentor;
        });

        // Step 6: Group the inactive students by their assigned mentor's email
        const groupedByMentor = {};

        inactiveRecords.forEach((record) => {
            const mentorUserId = studentToMentorMap[record.user_id];
            if (!mentorUserId) return; 

            const mentor = mentorDataMap[mentorUserId];
            if (!mentor || !mentor.kalvium_email) return; 

            const student = {
                name: record.profiles.name,
                email: record.profiles.kalvium_email,
                lastSolved: record.last_solved_at 
                    ? new Date(record.last_solved_at).toLocaleDateString() 
                    : "Never or Unknown",
            };

            if (!groupedByMentor[mentor.kalvium_email]) {
                groupedByMentor[mentor.kalvium_email] = {
                    mentorName: mentor.name || "Mentor",
                    students: [],
                };
            }
            groupedByMentor[mentor.kalvium_email].students.push(student);
        });

        // Step 7: Send grouped emails to each identified mentor
        for (const [mentorEmail, data] of Object.entries(groupedByMentor)) {
            const studentListHtml = data.students
                .map((s) => `<li><strong>${s.name}</strong> (${s.email}) - Last active: ${s.lastSolved}</li>`)
                .join("");

            const mailOptions = {
                from: '"Kalvium Portfolio Management" <kpm-squad@googlegroups.com>',
                to: testemail,
                subject: "Daily Report: Inactive Students on LeetCode",
                html: `
                    <h3>Hello ${data.mentorName},</h3>
                    <p>The following assigned students in your squad have been inactive on LeetCode for over 7 days:</p>
                    <ul>
                        ${studentListHtml}
                    </ul>
                    <p>Please reach out to them to check in on their progress.</p>
                `,
            };

            await transporter.sendMail(mailOptions);
            console.log(`[EMAIL SENT] Notified mentor: ${mentorEmail} about ${data.students.length} students.`);
        }

        console.log("[EMAIL SYSTEM] Finished sending mentor notifications.");

    } catch (err) {
        console.error("[EMAIL SYSTEM ERROR] Failed to send mentor notifications:", err.message);
    }
}

// ============================================================
// 4. SYNC ONE LEETCODE PROFILE
// ============================================================

async function syncSingleLeetCodeProfile(
    profileId,
    userId,
    rawLeetCodeUrl,
    maxRetries = MAX_RETRIES
) {
    const username = extractUsername(rawLeetCodeUrl);

    console.log("\n┌──────────────────────────────────────────────");
    console.log("│ SYNC PROFILE");
    console.log("├──────────────────────────────────────────────");
    console.log(`│ Profile ID : ${profileId}`);
    console.log(`│ User ID    : ${userId}`);
    console.log(`│ Raw URL    : ${rawLeetCodeUrl}`);
    console.log(`│ Username   : ${username}`);
    console.log("└──────────────────────────────────────────────");

    if (!username || !isValidLeetCodeUsername(username)) {
        console.warn("⚠️ [INVALID LEETCODE USERNAME]", { profileId, rawLeetCodeUrl, username });
        return { status: "INVALID_URL", username: username || rawLeetCodeUrl };
    }

    const query = `
        query getUserStats($username: String!) {
            matchedUser(username: $username) {
                username
                submitStatsGlobal {
                    acSubmissionNum { difficulty count }
                }
                profile { ranking }
            }
            recentAcSubmissionList(username: $username, limit: 1) {
                timestamp
            }
        }
    `;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`[LEETCODE] ${username} | Request ${attempt}/${maxRetries}`);

            const response = await fetch(LEETCODE_GRAPHQL_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Referer: "https://leetcode.com",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36",
                },
                body: JSON.stringify({ query, variables: { username } }),
            });

            console.log(`📡 [LEETCODE RESPONSE] ${username} | HTTP ${response.status}`);

            if (response.status === 429 || response.status >= 500) {
                const backoffTime = attempt * 5000;
                console.warn(`[LEETCODE RETRY] ${username} | HTTP ${response.status} | Waiting ${backoffTime}ms`);
                await delay(backoffTime);
                continue;
            }

            if (!response.ok) {
                console.error(`[LEETCODE HTTP ERROR] ${username} | HTTP ${response.status}`);
                return { status: "HTTP_ERROR", username, httpCode: response.status };
            }

            const result = await response.json();

            if (result.errors) {
                const errorMessage = result.errors[0]?.message || "Unknown GraphQL error";
                console.error(`[LEETCODE GRAPHQL ERROR] ${username}`);
                console.error(JSON.stringify(result.errors, null, 2));

                const isRateLimited = result.errors.some((err) =>
                    err.message?.toLowerCase().includes("rate") || err.message?.toLowerCase().includes("many requests")
                );

                if (isRateLimited && attempt < maxRetries) {
                    const waitTime = attempt * 5000;
                    console.warn(`[RATE LIMIT RETRY] ${username} | Waiting ${waitTime}ms`);
                    await delay(waitTime);
                    continue;
                }

                return { status: "GRAPHQL_ERROR", username, error: errorMessage, details: result.errors };
            }

            const matchedUser = result?.data?.matchedUser;
            if (!matchedUser) {
                console.warn(`[LEETCODE USER NOT FOUND] ${username}`);
                return { status: "NOT_FOUND", username };
            }

            console.log(`[LEETCODE USER FOUND] ${matchedUser.username}`);

            const submitStats = matchedUser.submitStatsGlobal?.acSubmissionNum || [];
            const totalSolved = submitStats.find((s) => s.difficulty === "All")?.count || 0;
            const easySolved = submitStats.find((s) => s.difficulty === "Easy")?.count || 0;
            const mediumSolved = submitStats.find((s) => s.difficulty === "Medium")?.count || 0;
            const hardSolved = submitStats.find((s) => s.difficulty === "Hard")?.count || 0;
            const ranking = matchedUser.profile?.ranking || 0;
            const score = easySolved * 1 + mediumSolved * 1.5 + hardSolved * 2;

            console.log("\n[LEETCODE STATS]");
            console.log(`   Username : ${matchedUser.username}`);
            console.log(`   Total    : ${totalSolved}`);
            console.log(`   Score    : ${score}`);

            const recentSubmissions = result?.data?.recentAcSubmissionList || [];
            let lastSolvedAt = null;

            if (recentSubmissions.length > 0 && recentSubmissions[0]?.timestamp) {
                const unixSec = Number(recentSubmissions[0].timestamp);
                if (!Number.isNaN(unixSec) && unixSec > 0) {
                    lastSolvedAt = new Date(unixSec * 1000).toISOString();
                }
            }

            if (!lastSolvedAt) {
                console.log(`[DB LOOKUP] No recent submission found. Checking existing last_solved_at...`);
                const { data: existingData, error: existingError } = await supabaseAdmin
                    .from("leetcode_leaderboard")
                    .select("last_solved_at")
                    .eq("profile_id", profileId)
                    .maybeSingle();

                if (existingError) {
                    logSupabaseError(`Existing leaderboard lookup failed`, existingError, { profileId, username });
                }
                lastSolvedAt = existingData?.last_solved_at || null;
            }

            const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
            const isLeetCodeActive = lastSolvedAt
                ? Date.now() - new Date(lastSolvedAt).getTime() <= SEVEN_DAYS_MS
                : false;

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
                last_solved_at: lastSolvedAt,
                is_leetcode_active: isLeetCodeActive,
            };

            console.log(`[DB UPSERT] ${username} | Updating leetcode_leaderboard...`);

            const { data: savedData, error: dbError } = await supabaseAdmin
                .from("leetcode_leaderboard")
                .upsert(upsertPayload, { onConflict: "profile_id" })
                .select()
                .single();

            if (dbError) {
                logSupabaseError(`Leaderboard upsert failed for ${username}`, dbError, { profileId, userId, username, attempt, payload: upsertPayload });
                if (attempt < maxRetries) {
                    console.warn(`[DB RETRY] ${username} | Attempt ${attempt}/${maxRetries}`);
                    await delay(2000);
                    continue;
                }
                return { status: "DB_ERROR", username, error: dbError.message, details: dbError.details, hint: dbError.hint, code: dbError.code };
            }

            console.log(`[DB SUCCESS] ${username} | Score: ${score}`);
            return { status: "SUCCESS", username: matchedUser.username, isActive: isLeetCodeActive, score };

        } catch (error) {
            console.error(`[SYNC EXCEPTION] ${username}`);
            console.error({ profileId, userId, attempt, message: error.message, stack: error.stack });
            if (attempt < maxRetries) {
                const waitTime = attempt * 3000;
                console.warn(`[NETWORK RETRY] ${username} | Waiting ${waitTime}ms`);
                await delay(waitTime);
            } else {
                return { status: "NETWORK_ERROR", username, error: error.message, stack: error.stack };
            }
        }
    }
}

// ============================================================
// UPDATE LEADERBOARD ROUTE
// ============================================================

router.post("/update-leetcode", async (req, res) => {
    const startTime = Date.now();

    console.log("\n============================================================");
    console.log("LEETCODE LEADERBOARD UPDATE STARTED");
    console.log("============================================================");

    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        console.error("[AUTH FAILED] Invalid CRON_SECRET");
        return res.status(401).json({ error: "Unauthorized" });
    }

    console.log("[AUTH SUCCESS] Cron request authenticated.");
    res.status(200).json({ message: "Leaderboard update process started in background." });

    try {
        console.log("\n[PROFILE FETCH] Fetching profiles...");
        let users = null;
        let fetchError = null;

        for (let attempt = 1; attempt <= 3; attempt++) {
            const { data, error } = await supabaseAdmin
                .from("profiles")
                .select("id, user_id, leetcode")
                .not("user_id", "is", null)
                .not("leetcode", "is", null)
                .neq("leetcode", "");

            if (!error) {
                users = data;
                break;
            }

            fetchError = error;
            logSupabaseError(`Profiles fetch attempt ${attempt}`, error);
            await delay(2000);
        }

        if (!users) {
            console.error("[CRON FATAL] Unable to fetch profiles.");
            console.error(fetchError);
            return;
        }

        console.log(`[PROFILE FETCH SUCCESS] Found ${users.length} profiles.`);

        for (let index = 0; index < users.length; index++) {
            const user = users[index];
            const result = await syncSingleLeetCodeProfile(user.id, user.user_id, user.leetcode);
            await delay(getRandomDelay(1500, 3000));
        }

        // ============================================================
        // 5. TRIGGER THE NOTIFICATION FUNCTION HERE
        // ============================================================
        await notifyMentorsAboutInactiveStudents();

        console.log(`\nFinished : ${new Date().toISOString()}`);
        console.log("============================================================\n");
    } catch (error) {
        console.error("\n ==================================================");
        console.error(" [CRON FATAL EXCEPTION]");
        console.error(" ==================================================");
        console.error({ message: error.message, stack: error.stack });
    }
});

export default router;