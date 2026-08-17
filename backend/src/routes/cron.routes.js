import express from "express";
import { supabaseAdmin } from "../config/supabase.js";

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
// 3. NOTIFY MENTORS VIA BREVO REST API (CATEGORIZED BY INACTIVITY)
// ============================================================
async function notifyMentorsAboutInactiveStudents() {
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

        // Step 3: Map students to mentors (Supports MULTIPLE mentors per student)
        const studentToMentorsMap = {};
        assignments.forEach(assignment => {
            if (!studentToMentorsMap[assignment.student_user_id]) {
                studentToMentorsMap[assignment.student_user_id] = [];
            }
            studentToMentorsMap[assignment.student_user_id].push(assignment.mentor_user_id);
        });

        // Step 4: Figure out which Mentors we need to email
        const activeMentorIdsToFetch = new Set();
        inactiveRecords.forEach(record => {
            const mentorIds = studentToMentorsMap[record.user_id] || [];
            mentorIds.forEach(mId => activeMentorIdsToFetch.add(mId));
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

        // Step 6: Group students under ALL assigned mentors into 7+ days and 1-6 days categories
        const groupedByMentor = {};
        const nowMs = Date.now();
        const ONE_DAY_MS = 24 * 60 * 60 * 1000;

        inactiveRecords.forEach((record) => {
            const mentorUserIds = studentToMentorsMap[record.user_id] || [];
            if (mentorUserIds.length === 0) return; 

            const lastSolvedDate = record.last_solved_at ? new Date(record.last_solved_at) : null;
            const daysInactive = lastSolvedDate
                ? Math.floor((nowMs - lastSolvedDate.getTime()) / ONE_DAY_MS)
                : null; // null means never solved or missing date

            const student = {
                name: record.profiles.name,
                email: record.profiles.kalvium_email,
                lastSolved: lastSolvedDate ? lastSolvedDate.toLocaleDateString() : "Never / Unknown",
                daysInactive: daysInactive !== null ? daysInactive : "Unknown",
            };

            // Loop through every mentor assigned to this student
            mentorUserIds.forEach((mentorUserId) => {
                const mentor = mentorDataMap[mentorUserId];
                if (!mentor || !mentor.kalvium_email) return; 

                if (!groupedByMentor[mentor.kalvium_email]) {
                    groupedByMentor[mentor.kalvium_email] = {
                        mentorName: mentor.name || "Mentor",
                        sevenDaysPlus: [],
                        oneToSixDays: [],
                    };
                }

                // Categorize into 7+ days vs 1-6 days
                if (daysInactive === null || daysInactive >= 7) {
                    groupedByMentor[mentor.kalvium_email].sevenDaysPlus.push(student);
                } else {
                    groupedByMentor[mentor.kalvium_email].oneToSixDays.push(student);
                }
            });
        });

        // Step 7: Send categorized email reports via Brevo REST API
        for (const [mentorEmail, data] of Object.entries(groupedByMentor)) {
            const renderList = (students) =>
                students
                    .map((s) => `<li><strong>${s.name}</strong> (${s.email}) — Last active: ${s.lastSolved} (${s.daysInactive} days inactive)</li>`)
                    .join("");

            const sevenDaysHtml = data.sevenDaysPlus.length
                ? `<ul>${renderList(data.sevenDaysPlus)}</ul>`
                : `<p><em>No students inactive for 7+ days.</em></p>`;

            const oneToSixDaysHtml = data.oneToSixDays.length
                ? `<ul>${renderList(data.oneToSixDays)}</ul>`
                : `<p><em>No students inactive in the 1–6 day window.</em></p>`;

            const totalCount = data.sevenDaysPlus.length + data.oneToSixDays.length;

            const response = await fetch("https://api.brevo.com/v3/smtp/email", {
                method: "POST",
                headers: {
                    "accept": "application/json",
                    "content-type": "application/json",
                    "api-key": process.env.BREVO_API_KEY,
                },
                body: JSON.stringify({
                    sender: {
                        name: "Kalvium Portfolio Management",
                        email: "kpm-squad@googlegroups.com",
                    },
                    to: [{ email: testemail, name: data.mentorName }],
                    subject: `Daily Report [${data.mentorName}]: Squad LeetCode Inactivity Summary`,
                    htmlContent: `
                        <h3>Hello ${data.mentorName},</h3>
                        <p>Here is the daily LeetCode inactivity report for your squad:</p>
                        
                        <h4 style="color: #d9534f;">🚨 High Priority: Inactive for 7+ Days (${data.sevenDaysPlus.length})</h4>
                        ${sevenDaysHtml}

                        <h4 style="color: #f0ad4e;">⚠️ Warning: Inactive for 1–6 Days (${data.oneToSixDays.length})</h4>
                        ${oneToSixDaysHtml}

                        <p>Please reach out to your squad members to keep them on track.</p>
                    `,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error(`[EMAIL ERROR] Brevo API failed for ${mentorEmail}:`, errorData);
            } else {
                console.log(`[EMAIL SENT] Notified mentor ${data.mentorName} (${mentorEmail}) about ${totalCount} inactive students.`);
            }
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

            // Flag as inactive if last solved was 24+ hours ago
            const ONE_DAY_MS = 24 * 60 * 60 * 1000;
            const isLeetCodeActive = lastSolvedAt
                ? Date.now() - new Date(lastSolvedAt).getTime() <= ONE_DAY_MS
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