import express from 'express';
import rateLimit from 'express-rate-limit';
import { supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Generate a random delay with jitter 
const getRandomDelay = (min = 1500, max = 3000) => 
    Math.floor(Math.random() * (max - min + 1)) + min;

const isValidLeetCodeUsername = (username) => /^[a-zA-Z0-9_-]{1,30}$/.test(username);

const extractUsername = (input) => {
    if (!input) return null;
    const cleanInput = input.trim();
    try {
        if (!cleanInput.includes("leetcode.com")) return cleanInput;
        return cleanInput.match(/leetcode\.com\/(?:u\/)?([^/]+)/)?.[1]?.replace(/\/$/, "") || null;
    } catch (e) {
        return null;
    }
};

// --- Helper: Fetch LeetCode Stats with Full API & DB Retry Logic ---
async function syncSingleLeetCodeProfile(profileId, userId, rawLeetCodeUrl, maxRetries = 3) {
    const username = extractUsername(rawLeetCodeUrl);
    if (!username || !isValidLeetCodeUsername(username)) return;

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

            // 1. Retry HTTP 429 (Rate Limit) or 5xx (Server Error) with Exponential Backoff
            if (response.status === 429 || response.status >= 500) {
                const backoffTime = attempt * 5000; // 5s, 10s, 15s
                console.warn(`[HTTP ${response.status}] Retrying ${username} in ${backoffTime / 1000}s (Attempt ${attempt}/${maxRetries})...`);
                await delay(backoffTime);
                continue;
            }

            if (!response.ok) return;

            const result = await response.json();

            // 2. Retry GraphQL-level rate limit errors
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
                return;
            }

            const matchedUser = result?.data?.matchedUser;

            if (!matchedUser) {
                console.warn(`[LeetCode Profile Not Found] ${username}`);
                return;
            }

            const submitStats = matchedUser.submitStatsGlobal?.acSubmissionNum || [];
            const totalSolved = submitStats.find(s => s.difficulty === "All")?.count || 0;
            const easySolved = submitStats.find(s => s.difficulty === "Easy")?.count || 0;
            const mediumSolved = submitStats.find(s => s.difficulty === "Medium")?.count || 0;
            const hardSolved = submitStats.find(s => s.difficulty === "Hard")?.count || 0;
            const ranking = matchedUser.profile?.ranking || 0;

            const score = (easySolved * 1) + (mediumSolved * 3) + (hardSolved * 5);

            // 3. Database Upsert with error checking & retry capability
            const { error: dbError } = await supabaseAdmin
                .from("leetcode_leaderboard")
                .upsert({
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
                }, { onConflict: "profile_id" });

            if (dbError) {
                console.error(`[DB Error] Upsert failed for ${username}:`, dbError.message);
                if (attempt < maxRetries) {
                    await delay(2000);
                    continue; 
                }
                return;
            }

            console.log(`[Cron Success] Updated ${matchedUser.username}`);
            return; 
        } catch (err) {
            // 4. Catch Network Exceptions
            if (attempt < maxRetries) {
                const backoffTime = attempt * 3000;
                console.warn(`[Network Error] Retrying ${username} in ${backoffTime / 1000}s (Attempt ${attempt}/${maxRetries}):`, err.message);
                await delay(backoffTime);
            } else {
                console.error(`[Cron Fatal] Failed updating ${username} after ${maxRetries} attempts:`, err.message);
            }
        }
    }
}

// ===========================================
// 1. POST /update-leetcode (Cron Job Endpoint)
// ===========================================
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

        console.log(`[Cron] Syncing stats for ${users.length} profiles...`);

        for (const user of users) {
            await syncSingleLeetCodeProfile(user.id, user.user_id, user.leetcode);
            await delay(getRandomDelay(1500, 3000));
        }

        console.log("[Cron Complete] Leaderboard updated successfully.");
    } catch (err) {
        console.error("[Cron Fatal Error]:", err.message);
    }
});

export default router;