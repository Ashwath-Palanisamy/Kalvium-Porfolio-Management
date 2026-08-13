import express from 'express';
import rateLimit from 'express-rate-limit';
import { supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getRandomDelay = (min = 1500, max = 3000) => 
    Math.floor(Math.random() * (max - min + 1)) + min;

const isValidLeetCodeUsername = (username) => /^[a-zA-Z0-9_-]{1,30}$/.test(username);

const extractUsername = (input) => {
    if (!input) return null;
    let cleanInput = input.trim();
    try {
        cleanInput = cleanInput.split('?')[0].split('#')[0];
        if (!cleanInput.includes("leetcode.com")) return cleanInput.replace(/\/$/, "");
        return cleanInput.match(/leetcode\.com\/(?:u\/)?([^/]+)/)?.[1]?.replace(/\/$/, "") || null;
    } catch (e) {
        return null;
    }
};

async function syncSingleLeetCodeProfile(profileId, userId, rawLeetCodeUrl, maxRetries = 3) {
    const username = extractUsername(rawLeetCodeUrl);

    // Skip invalid usernames and log
    if (!username || !isValidLeetCodeUsername(username)) {
        console.warn(`[Skip Invalid Username] Profile ID: ${profileId} | Raw: "${rawLeetCodeUrl}" | Extracted: "${username}"`);
        return { status: 'INVALID_URL', username: username || rawLeetCodeUrl };
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
        }
    `;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch("https://leetcode.com/graphql", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Referer": "https://leetcode.com",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
                },
                body: JSON.stringify({ query, variables: { username } })
            });

            // Handle HTTP rate limits and server errors with exponential backoff
            if (response.status === 429 || response.status >= 500) {
                const backoffTime = attempt * 5000;
                console.warn(`[HTTP ${response.status}] Retrying ${username} in ${backoffTime / 1000}s (Attempt ${attempt}/${maxRetries})...`);
                await delay(backoffTime);
                continue;
            }

            // Log and handle non-200 HTTP errors
            if (!response.ok) {
                console.error(`[HTTP Error ${response.status}] Failed fetching ${username}: ${response.statusText}`);
                return { status: 'HTTP_ERROR', username, status: response.status };
            }

            const result = await response.json();

            // Handle GraphQL-specific rate limit errors
            if (result.errors) {
                const isRateLimited = result.errors.some(err => 
                    err.message?.toLowerCase().includes("rate") || 
                    err.message?.toLowerCase().includes("many requests")
                );

                if (isRateLimited && attempt < maxRetries) {
                    const backoffTime = attempt * 5000;
                    console.warn(`[GraphQL Rate Limit] Retrying ${username} in ${backoffTime / 1000}s (Attempt ${attempt}/${maxRetries})...`);
                    await delay(backoffTime);
                    continue;
                }

                console.error(`[GraphQL Error] ${username}:`, result.errors[0]?.message);
                return { status: 'GRAPHQL_ERROR', username, error: result.errors[0]?.message };
            }

            const matchedUser = result?.data?.matchedUser;

            if (!matchedUser) {
                console.warn(`[LeetCode Profile Not Found] Username: "${username}" (Profile ID: ${profileId})`);
                return { status: 'NOT_FOUND', username };
            }

            const submitStats = matchedUser.submitStatsGlobal?.acSubmissionNum || [];
            const totalSolved = submitStats.find(s => s.difficulty === "All")?.count || 0;
            const easySolved = submitStats.find(s => s.difficulty === "Easy")?.count || 0;
            const mediumSolved = submitStats.find(s => s.difficulty === "Medium")?.count || 0;
            const hardSolved = submitStats.find(s => s.difficulty === "Hard")?.count || 0;
            const ranking = matchedUser.profile?.ranking || 0;

            const score = (easySolved * 1) + (mediumSolved * 1.5) + (hardSolved * 2);

            // Fetch existing record to track activity changes
            const { data: existingData } = await supabaseAdmin
                .from("leetcode_leaderboard")
                .select("total_solved, last_solved_at")
                .eq("profile_id", profileId)
                .single();

            const currentTotalInDb = existingData?.total_solved || 0;
            let lastSolvedAt = existingData?.last_solved_at || null; 

            // Update last_solved_at if total_solved increased
            if (totalSolved > currentTotalInDb) {
                lastSolvedAt = new Date().toISOString();
            }

            // Upsert leaderboard stats with conditional activity timestamp
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
                updated_at: new Date().toISOString() 
            };

            // Append last_solved_at safely
            if (lastSolvedAt) {
                upsertPayload.last_solved_at = lastSolvedAt;
            }

            const { error: dbError } = await supabaseAdmin
                .from("leetcode_leaderboard")
                .upsert(upsertPayload, { onConflict: "profile_id" });

            if (dbError) {
                console.error(`[DB Upsert Error] Failed for ${username} (Profile ID: ${profileId}):`, dbError.message);
                if (attempt < maxRetries) {
                    await delay(2000);
                    continue; 
                }
                return { status: 'DB_ERROR', username, error: dbError.message };
            }

            console.log(`[Cron Success] Updated ${matchedUser.username}`);
            return { status: 'SUCCESS', username: matchedUser.username };

        } catch (err) {
            if (attempt < maxRetries) {
                const backoffTime = attempt * 3000;
                console.warn(`[Network Error] Retrying ${username} in ${backoffTime / 1000}s (Attempt ${attempt}/${maxRetries}):`, err.message);
                await delay(backoffTime);
            } else {
                console.error(`[Cron Fatal] Failed updating ${username} after ${maxRetries} attempts:`, err.message);
                return { status: 'NETWORK_ERROR', username, error: err.message };
            }
        }
    }
}

router.post("/update-leetcode", async (req, res) => {
    const authHeader = req.headers.authorization;

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    res.status(200).json({ message: "Leaderboard update process started in background." });

    try {
        let users = null;
        let fetchError = null;

        for (let i = 1; i <= 3; i++) {
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
            console.warn(`[Cron DB Fetch Retry] Attempt ${i}/3 failed:`, error.message);
            await delay(2000);
        }

        if (!users) {
            console.error("[Cron Fatal Error] Could not fetch profiles after retries:", fetchError?.message);
            return;
        }

        console.log(`[Cron Start] Fetched ${users.length} profiles with LeetCode links from DB.`);

        const stats = {
            totalFetched: users.length,
            success: 0,
            invalidUrl: 0,
            notFound: 0,
            httpError: 0,
            graphqlError: 0,
            dbError: 0,
            networkError: 0
        };

        let count = 0;
        for (const user of users) {
            count++;
            console.log(`\n[ Cron Progress ${count}/${users.length} ] Processing Profile ID: ${user.id} | Raw Input: "${user.leetcode}"`);

            const result = await syncSingleLeetCodeProfile(user.id, user.user_id, user.leetcode);

            switch (result?.status) {
                case 'SUCCESS': stats.success++; break;
                case 'INVALID_URL': stats.invalidUrl++; break;
                case 'NOT_FOUND': stats.notFound++; break;
                case 'HTTP_ERROR': stats.httpError++; break;
                case 'GRAPHQL_ERROR': stats.graphqlError++; break;
                case 'DB_ERROR': stats.dbError++; break;
                default: stats.networkError++; break;
            }

            await delay(getRandomDelay(1500, 3000));
        }

        console.log("\n================ [Cron Execution Summary] ================");
        console.log(`Total Profiles Fetched from DB : ${stats.totalFetched}`);
        console.log(`Successfully Saved to DB      : ${stats.success}`);
        console.log(`Skipped (Invalid URL/Username): ${stats.invalidUrl}`);
        console.log(`LeetCode User Not Found (404) : ${stats.notFound}`);
        console.log(`HTTP Request Errors (Non-200) : ${stats.httpError}`);
        console.log(`GraphQL API Errors            : ${stats.graphqlError}`);
        console.log(`Database Upsert Errors        : ${stats.dbError}`);
        console.log(`Network Exceptions            : ${stats.networkError}`);
        console.log("==========================================================\n");

    } catch (err) {
        console.error("[Cron Fatal Error]:", err.message);
    }
});

export default router;