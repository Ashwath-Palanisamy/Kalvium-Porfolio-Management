import express from "express";
import { createAuthedSupabaseClient, supabase } from "../config/supabase.js";

const router = express.Router();

router.get("/profile", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Missing or invalid Authorization header" });
        }

        const token = authHeader.split(" ")[1];
        const authedSupabase = createAuthedSupabaseClient(token);

        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({ error: "Invalid or expired token" });
        }

        req.user = user;

        const { data, error } = await authedSupabase
            .from("profiles")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({ error: "Profile not found for this user." });
        }

        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json({ error: "Request failed: " + err.message });
    }
});

router.put("/updateprofile", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Missing or invalid Authorization header" });
        }

        const token = authHeader.split(" ")[1];
        const authedSupabase = createAuthedSupabaseClient(token);

        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) {
            return res.status(401).json({ error: "Invalid or expired token" });
        }

        const updatePayload = req.body;
        if (!updatePayload || Object.keys(updatePayload).length === 0) {
            return res.status(400).json({ error: "No profile data provided to update." });
        }

        const { 
            id, 
            auth_id, 
            user_id, 
            display_id, 
            kalvium_email, 
            kalviumEmail, 
            squadId, 
            personalEmail, 
            resumeUrl, 
            ...restPayload 
        } = updatePayload;

        const rawSquad = squadId !== undefined ? squadId : restPayload.squad_id;
        const parsedSquad = rawSquad !== "" && rawSquad !== null && rawSquad !== undefined ? parseInt(rawSquad, 10) : null;

        const cleanPayload = {
            ...restPayload,
            user_id: user.id, 
            squad_id: Number.isNaN(parsedSquad) ? null : parsedSquad,
            personal_email: personalEmail !== undefined ? personalEmail : restPayload.personal_email || null,
            resume_url: resumeUrl !== undefined ? resumeUrl : restPayload.resume_url || null,
        };

        let { data, error: dbError } = await authedSupabase
            .from("profiles")
            .update(cleanPayload)
            .eq("user_id", user.id)
            .select()
            .maybeSingle();

        if (!data && !dbError) {
            const insertResult = await authedSupabase
                .from("profiles")
                .insert([cleanPayload])
                .select()
                .single();

            data = insertResult.data;
            dbError = insertResult.error;
        }

        if (dbError) {
            console.error("Database error:", dbError);
            return res.status(500).json({ error: dbError.message || "Failed to save profile." });
        }

        return res.status(200).json({
            message: "Profile saved successfully",
            data: data
        });

    } catch (err) {
        console.error("Server error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

const extractUsername = (url, platform) => {
    if (!url) return null;
    try {
        if (platform === "github") return url.match(/github\.com\/([^/]+)/)?.[1] || null;
        if (platform === "leetcode") return url.match(/leetcode\.com\/(?:u\/)?([^/]+)/)?.[1] || null;
    } catch (e) {
        return null;
    }
    return null;
};

// Fetch GitHub Stats
router.post("/github", async (req, res) => {
    const { url } = req.body;
    const username = extractUsername(url, "github");
    
    if (!username) return res.status(400).json({ error: "Invalid GitHub URL" });

    try {
        const headers = { "User-Agent": "Student-Dashboard-App" };
        const [userRes, reposRes] = await Promise.all([
            fetch(`https://api.github.com/users/${username}`, { headers }),
            fetch(`https://api.github.com/users/${username}/repos?sort=pushed&per_page=1`, { headers })
        ]);

        if (!userRes.ok) {
            return res.status(userRes.status).json({ error: "GitHub user not found or rate limited" });
        }

        const userData = await userRes.json();
        const reposData = reposRes.ok ? await reposRes.json() : [];

        return res.status(200).json({
            repos: userData.public_repos || 0,
            followers: userData.followers || 0,
            recentRepo: Array.isArray(reposData) && reposData.length > 0 ? reposData[0].name : "No recent activity",
        });
    } catch (err) {
        console.error("GitHub Fetch Error:", err);
        return res.status(500).json({ error: "Failed to fetch GitHub data" });
    }
});

// Fetch LeetCode Stats (Directly from LeetCode Official GraphQL API)
router.post("/leetcode", async (req, res) => {
    const { url } = req.body;
    const username = extractUsername(url, "leetcode");

    if (!username) return res.status(400).json({ error: "Invalid LeetCode URL" });

    try {
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
                        reputation
                    }
                }
            }
        `;

        const response = await fetch("https://leetcode.com/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Referer": "https://leetcode.com",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
            body: JSON.stringify({
                query,
                variables: { username }
            })
        });

        if (!response.ok) {
            return res.status(502).json({ error: "Failed to reach official LeetCode service" });
        }

        const result = await response.json();

        if (!result.data || !result.data.matchedUser) {
            return res.status(404).json({ error: "LeetCode profile not found for this username" });
        }

        const user = result.data.matchedUser;
        const submitStats = user.submitStatsGlobal?.acSubmissionNum || [];

        const totalSolved = submitStats.find(s => s.difficulty === "All")?.count || 0;
        const easySolved = submitStats.find(s => s.difficulty === "Easy")?.count || 0;
        const mediumSolved = submitStats.find(s => s.difficulty === "Medium")?.count || 0;
        const hardSolved = submitStats.find(s => s.difficulty === "Hard")?.count || 0;

        return res.status(200).json({
            username: user.username,
            totalSolved,
            easySolved,
            mediumSolved,
            hardSolved,
            ranking: user.profile?.ranking || "N/A",
            acceptanceRate: 0,
            currentlyAttempting: totalSolved > 0 ? "Active in Problem Solving" : "Not started"
        });

    } catch (err) {
        console.error("LeetCode Fetch Error:", err);
        return res.status(500).json({ error: "Failed to fetch LeetCode data: " + err.message });
    }
});

export default router;