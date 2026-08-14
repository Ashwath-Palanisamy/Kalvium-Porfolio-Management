import express from "express";
import { supabaseAdmin } from "../config/supabase.js";

const router = express.Router();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getRandomDelay = (min = 1500, max = 3000) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const isValidLeetCodeUsername = (username) =>
    /^[a-zA-Z0-9_-]{1,30}$/.test(username);

const extractUsername = (input) => {
    if (!input) return null;

    let cleanInput = input.trim();

    try {
        cleanInput = cleanInput.split("?")[0].split("#")[0];

        if (!cleanInput.includes("leetcode.com")) {
            return cleanInput.replace(/\/$/, "");
        }

        return (
            cleanInput
                .match(/leetcode\.com\/(?:u\/)?([^/]+)/)?.[1]
                ?.replace(/\/$/, "") || null
        );
    } catch (error) {
        console.error("[Username Extraction Error]", {
            input,
            error: error.message,
        });

        return null;
    }
};

/**
 * Print Supabase errors in a useful format.
 */
const logSupabaseError = (context, error, extra = {}) => {
    console.error(`\n========== [SUPABASE ERROR] ${context} ==========`);

    console.error(
        JSON.stringify(
            {
                ...extra,
                message: error?.message,
                details: error?.details,
                hint: error?.hint,
                code: error?.code,
            },
            null,
            2
        )
    );

    console.error("====================================================\n");
};

async function syncSingleLeetCodeProfile(
    profileId,
    userId,
    rawLeetCodeUrl,
    maxRetries = 3
) {
    const username = extractUsername(rawLeetCodeUrl);

    console.log("\n----------------------------------------------------");
    console.log("[SYNC START]");
    console.log("Profile ID :", profileId);
    console.log("User ID    :", userId);
    console.log("Raw URL    :", rawLeetCodeUrl);
    console.log("Username   :", username);
    console.log("----------------------------------------------------");

    if (!username || !isValidLeetCodeUsername(username)) {
        console.warn("[INVALID USERNAME]", {
            profileId,
            rawLeetCodeUrl,
            username,
        });

        return {
            status: "INVALID_URL",
            username: username || rawLeetCodeUrl,
        };
    }

    const query = `
        query getUserStats($username: String!) {
            matchedUser(username: $username) {
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

            recentAcSubmissionList(username: $username, limit: 1) {
                timestamp
            }
        }
    `;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(
                `[LEETCODE REQUEST] ${username} | Attempt ${attempt}/${maxRetries}`
            );

            const response = await fetch("https://leetcode.com/graphql", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Referer: "https://leetcode.com",
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36",
                },
                body: JSON.stringify({
                    query,
                    variables: { username },
                }),
            });

            console.log(
                `[LEETCODE RESPONSE] ${username} | HTTP ${response.status}`
            );

            if (response.status === 429 || response.status >= 500) {
                const backoffTime = attempt * 5000;

                console.warn(
                    `[LEETCODE RETRY] ${username} | Status: ${response.status} | Waiting: ${backoffTime}ms`
                );

                await delay(backoffTime);
                continue;
            }

            if (!response.ok) {
                console.error(
                    `[LEETCODE HTTP ERROR] ${username} | Status: ${response.status}`
                );

                return {
                    status: "HTTP_ERROR",
                    username,
                    httpCode: response.status,
                };
            }

            const result = await response.json();

            if (result.errors) {
                console.error(
                    `[LEETCODE GRAPHQL ERROR] ${username}`,
                    JSON.stringify(result.errors, null, 2)
                );

                const isRateLimited = result.errors.some(
                    (err) =>
                        err.message?.toLowerCase().includes("rate") ||
                        err.message?.toLowerCase().includes("many requests")
                );

                if (isRateLimited && attempt < maxRetries) {
                    const waitTime = attempt * 5000;

                    console.warn(
                        `[LEETCODE RATE LIMIT] ${username} | Waiting ${waitTime}ms`
                    );

                    await delay(waitTime);
                    continue;
                }

                return {
                    status: "GRAPHQL_ERROR",
                    username,
                    error: result.errors[0]?.message,
                    details: result.errors,
                };
            }

            const matchedUser = result?.data?.matchedUser;

            if (!matchedUser) {
                console.warn(
                    `[LEETCODE USER NOT FOUND] ${username}`
                );

                return {
                    status: "NOT_FOUND",
                    username,
                };
            }

            console.log(
                `[LEETCODE USER FOUND] ${matchedUser.username}`
            );

            // ------------------------------------------------
            // PARSE LEETCODE STATS
            // ------------------------------------------------

            const submitStats =
                matchedUser.submitStatsGlobal?.acSubmissionNum || [];

            const totalSolved =
                submitStats.find((s) => s.difficulty === "All")?.count || 0;

            const easySolved =
                submitStats.find((s) => s.difficulty === "Easy")?.count || 0;

            const mediumSolved =
                submitStats.find((s) => s.difficulty === "Medium")?.count || 0;

            const hardSolved =
                submitStats.find((s) => s.difficulty === "Hard")?.count || 0;

            const ranking = matchedUser.profile?.ranking || 0;

            const score =
                easySolved * 1 +
                mediumSolved * 1.5 +
                hardSolved * 2;

            console.log("\n[LEETCODE STATS]", {
                username: matchedUser.username,
                easySolved,
                mediumSolved,
                hardSolved,
                totalSolved,
                ranking,
                score,
            });

            // ------------------------------------------------
            // LAST SOLVED
            // ------------------------------------------------

            const recentSubmissions =
                result?.data?.recentAcSubmissionList || [];

            let lastSolvedAt = null;

            if (
                recentSubmissions.length > 0 &&
                recentSubmissions[0]?.timestamp
            ) {
                const unixSec = Number(
                    recentSubmissions[0].timestamp
                );

                if (!isNaN(unixSec) && unixSec > 0) {
                    lastSolvedAt = new Date(
                        unixSec * 1000
                    ).toISOString();
                }
            }

            // ------------------------------------------------
            // EXISTING DB DATA
            // ------------------------------------------------

            if (!lastSolvedAt) {
                console.log(
                    `[DB LOOKUP] Checking existing last_solved_at for profile ${profileId}`
                );

                const { data: existingData, error: existingError } =
                    await supabaseAdmin
                        .from("leetcode_leaderboard")
                        .select("last_solved_at")
                        .eq("profile_id", profileId)
                        .maybeSingle();

                if (existingError) {
                    logSupabaseError(
                        `Existing row lookup failed for ${username}`,
                        existingError,
                        {
                            profileId,
                            userId,
                            username,
                        }
                    );
                }

                lastSolvedAt =
                    existingData?.last_solved_at || null;
            }

            // ------------------------------------------------
            // ACTIVITY
            // ------------------------------------------------

            const SEVEN_DAYS_MS =
                7 * 24 * 60 * 60 * 1000;

            const isLeetCodeActive = lastSolvedAt
                ? Date.now() -
                      new Date(lastSolvedAt).getTime() <=
                  SEVEN_DAYS_MS
                : false;

            // ------------------------------------------------
            // SUPABASE PAYLOAD
            // ------------------------------------------------

            const upsertPayload = {
                profile_id: profileId,
                user_id: userId,
                leetcode_username: matchedUser.username,
                easy_solved: easySolved,
                medium_solved: mediumSolved,
                hard_solved: hardSolved,
                total_solved: totalSolved,
                ranking: ranking,
                score: score,
                updated_at: new Date().toISOString(),
                last_solved_at: lastSolvedAt,
                is_leetcode_active: isLeetCodeActive,
                is_active: isLeetCodeActive,
            };

            console.log("\n[DB UPSERT START]");
            console.log("Table      : leetcode_leaderboard");
            console.log("Conflict   : profile_id");
            console.log("Profile ID :", profileId);
            console.log("Username   :", matchedUser.username);
            console.log("Payload    :", JSON.stringify(upsertPayload, null, 2));

            // ------------------------------------------------
            // UPSERT
            // ------------------------------------------------

            const { data: savedData, error: dbError } =
                await supabaseAdmin
                    .from("leetcode_leaderboard")
                    .upsert(upsertPayload, {
                        onConflict: "profile_id",
                    })
                    .select()
                    .single();

            if (dbError) {
                logSupabaseError(
                    `Leaderboard upsert failed for ${username}`,
                    dbError,
                    {
                        profileId,
                        userId,
                        username,
                        attempt,
                        payload: upsertPayload,
                    }
                );

                if (attempt < maxRetries) {
                    console.warn(
                        `[DB RETRY] ${username} | Attempt ${attempt}/${maxRetries}`
                    );

                    await delay(2000);
                    continue;
                }

                return {
                    status: "DB_ERROR",
                    username,
                    error: dbError.message,
                    details: dbError.details,
                    hint: dbError.hint,
                    code: dbError.code,
                };
            }

            console.log("\n[DB UPSERT SUCCESS]");
            console.log("Profile ID :", profileId);
            console.log("Username   :", matchedUser.username);
            console.log("Score      :", score);
            console.log("Saved Row  :", JSON.stringify(savedData, null, 2));

            console.log(
                `[SYNC SUCCESS] ${username} | Score: ${score}`
            );

            return {
                status: "SUCCESS",
                username: matchedUser.username,
                isActive: isLeetCodeActive,
                score,
            };
        } catch (err) {
            console.error("\n[SYNC EXCEPTION]", {
                profileId,
                userId,
                username,
                attempt,
                message: err.message,
                stack: err.stack,
            });

            if (attempt < maxRetries) {
                const waitTime = attempt * 3000;

                console.warn(
                    `[NETWORK RETRY] ${username} | Waiting ${waitTime}ms`
                );

                await delay(waitTime);
            } else {
                return {
                    status: "NETWORK_ERROR",
                    username,
                    error: err.message,
                    stack: err.stack,
                };
            }
        }
    }
}

// ============================================================
// UPDATE LEETCODE LEADERBOARD
// ============================================================

router.post("/update-leetcode", async (req, res) => {
    const startTime = Date.now();

    console.log("\n\n============================================================");
    console.log("🚀 LEETCODE LEADERBOARD CRON STARTED");
    console.log("Time:", new Date().toISOString());
    console.log("============================================================\n");

    const authHeader = req.headers.authorization;

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        console.error("[CRON AUTH ERROR] Invalid CRON_SECRET");

        return res.status(401).json({
            error: "Unauthorized",
        });
    }

    console.log("[CRON AUTH] Successfully authenticated.");

    res.status(200).json({
        message:
            "Leaderboard update process started in background.",
    });

    try {
        // ------------------------------------------------
        // FETCH PROFILES
        // ------------------------------------------------

        let users = null;
        let fetchError = null;

        for (let i = 1; i <= 3; i++) {
            console.log(
                `[PROFILE FETCH] Attempt ${i}/3`
            );

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

            logSupabaseError(
                `Profiles fetch attempt ${i}`,
                error
            );

            await delay(2000);
        }

        if (!users) {
            console.error(
                "[CRON FATAL ERROR] Could not fetch profiles:",
                fetchError
            );

            return;
        }

        console.log(
            `\n[CRON] Found ${users.length} profiles with LeetCode links.`
        );

        // ------------------------------------------------
        // STATISTICS
        // ------------------------------------------------

        const stats = {
            totalFetched: users.length,
            success: 0,
            activeCount: 0,
            invalidUrl: 0,
            notFound: 0,
            httpError: 0,
            graphqlError: 0,
            dbError: 0,
            networkError: 0,
        };

        const failures = [];

        // ------------------------------------------------
        // PROCESS USERS
        // ------------------------------------------------

        let count = 0;

        for (const user of users) {
            count++;

            console.log(
                `\n[CRON PROGRESS ${count}/${users.length}]`
            );

            console.log("Profile ID:", user.id);
            console.log("User ID   :", user.user_id);
            console.log("LeetCode  :", user.leetcode);

            const result =
                await syncSingleLeetCodeProfile(
                    user.id,
                    user.user_id,
                    user.leetcode
                );

            switch (result?.status) {
                case "SUCCESS":
                    stats.success++;

                    if (result.isActive) {
                        stats.activeCount++;
                    }

                    break;

                case "INVALID_URL":
                    stats.invalidUrl++;
                    failures.push({
                        profileId: user.id,
                        username: result.username,
                        status: result.status,
                    });
                    break;

                case "NOT_FOUND":
                    stats.notFound++;
                    failures.push({
                        profileId: user.id,
                        username: result.username,
                        status: result.status,
                    });
                    break;

                case "HTTP_ERROR":
                    stats.httpError++;
                    failures.push({
                        profileId: user.id,
                        username: result.username,
                        status: result.status,
                        httpCode: result.httpCode,
                    });
                    break;

                case "GRAPHQL_ERROR":
                    stats.graphqlError++;

                    failures.push({
                        profileId: user.id,
                        username: result.username,
                        status: result.status,
                        error: result.error,
                    });

                    console.error(
                        `[GRAPHQL FAILURE] ${result.username}`,
                        result.error
                    );

                    break;

                case "DB_ERROR":
                    stats.dbError++;

                    failures.push({
                        profileId: user.id,
                        username: result.username,
                        status: result.status,
                        error: result.error,
                        details: result.details,
                        hint: result.hint,
                        code: result.code,
                    });

                    console.error(
                        `[DB FAILURE] ${result.username}`,
                        {
                            error: result.error,
                            details: result.details,
                            hint: result.hint,
                            code: result.code,
                        }
                    );

                    break;

                default:
                    stats.networkError++;

                    failures.push({
                        profileId: user.id,
                        username: result?.username,
                        status: result?.status,
                        error: result?.error,
                    });

                    break;
            }

            await delay(getRandomDelay(1500, 3000));
        }

        // ------------------------------------------------
        // FINAL SUMMARY
        // ------------------------------------------------

        const durationSeconds =
            ((Date.now() - startTime) / 1000).toFixed(2);

        console.log(
            "\n\n============================================================"
        );
        console.log("📊 CRON EXECUTION SUMMARY");
        console.log(
            "============================================================"
        );

        console.log(
            `Total Profiles Fetched       : ${stats.totalFetched}`
        );

        console.log(
            `Successfully Saved to DB    : ${stats.success}`
        );

        console.log(
            `Active Users (7 days)       : ${stats.activeCount}`
        );

        console.log(
            `Invalid URLs                : ${stats.invalidUrl}`
        );

        console.log(
            `Users Not Found             : ${stats.notFound}`
        );

        console.log(
            `HTTP Errors                 : ${stats.httpError}`
        );

        console.log(
            `GraphQL Errors              : ${stats.graphqlError}`
        );

        console.log(
            `Database Errors             : ${stats.dbError}`
        );

        console.log(
            `Network Errors              : ${stats.networkError}`
        );

        console.log(
            `Execution Time              : ${durationSeconds}s`
        );

        console.log(
            `Success Rate                : ${
                stats.totalFetched
                    ? (
                          (stats.success /
                              stats.totalFetched) *
                          100
                      ).toFixed(2)
                    : 0
            }%`
        );

        // ------------------------------------------------
        // FAILURE DETAILS
        // ------------------------------------------------

        if (failures.length > 0) {
            console.log(
                "\n================ FAILURE DETAILS ================"
            );

            failures.forEach((failure, index) => {
                console.error(
                    `\n#${index + 1}`,
                    JSON.stringify(failure, null, 2)
                );
            });
        } else {
            console.log(
                "\n No failures detected."
            );
        }

        console.log(
            "\n============================================================\n"
        );
    } catch (err) {
        console.error(
            "\n[CRON FATAL EXCEPTION]"
        );

        console.error({
            message: err.message,
            stack: err.stack,
        });
    }
});

export default router;