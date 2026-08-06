import express from 'express';
import rateLimit from 'express-rate-limit';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// --- Rate Limiters Config ---
const allprofilesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 30, 
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many directory requests, please try again in 15 minutes.' }
});

const singleStudentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many profile requests, please try again in 15 minutes.' }
});

const statsRouteLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many stats requests. Please try again later." },
});

const updateProfileLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many profile update requests. Please try again later." },
});

// --- Validation Helpers ---
const isValidGitHubUsername = (username) => /^[a-zA-Z0-9-]{1,39}$/.test(username);
const isValidLeetCodeUsername = (username) => /^[a-zA-Z0-9_-]{1,30}$/.test(username);

const extractUsername = (input, platform) => {
    if (!input) return null;
    const cleanInput = input.trim();
    try {
        if (platform === "github") {
            if (!cleanInput.includes("github.com")) return cleanInput;
            return cleanInput.match(/github\.com\/([^/]+)/)?.[1]?.replace(/\/$/, "") || null;
        }
        if (platform === "leetcode") {
            if (!cleanInput.includes("leetcode.com")) return cleanInput;
            return cleanInput.match(/leetcode\.com\/(?:u\/)?([^/]+)/)?.[1]?.replace(/\/$/, "") || null;
        }
    } catch (e) {
        return null;
    }
    return null;
};

// ==========================================
// 1. GET all profiles or filter using ?user_id= query
// ==========================================
router.get('/profiles', allprofilesLimiter, async (req, res) => {
  try {
    const { user_id } = req.query;

    if (user_id) {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, name, title, role, avatar_url, github, leetcode, linkedin')
        .eq('user_id', user_id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Student not found' });
        }
        return res.status(400).json({ error: error.message });
      }

      return res.json(data);
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, name, title, squad_id , avatar_url, github, leetcode, linkedin');

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// ==========================================
// 2. GET single student profile using REST path parameter /profiles/:user_id
// ==========================================
router.get('/profiles/:user_id', singleStudentLimiter, async (req, res) => {
  try {
    const { user_id } = req.params;

    const { data, error } = await supabase
      .from('profiles')
      .select('*') 
      .eq('user_id', user_id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Student not found' });
      }
      return res.status(400).json({ error: error.message });
    }

    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// ==========================================
// 3. PUT / UPDATE Student Profile
// ==========================================
router.put("/updateprofile", updateProfileLimiter, async (req, res) => {
    try {
        const updatePayload = req.body;
        if (!updatePayload || Object.keys(updatePayload).length === 0) {
            return res.status(400).json({ error: "No profile data provided to update." });
        }

        const {
            id,
            auth_id,
            user_id, 
            display_id,
            name,
            kalvium_email,
            kalviumEmail,
            squadId,
            personalEmail,
            resumeUrl,
            ...restPayload
        } = updatePayload;

        if (!user_id) {
            return res.status(400).json({ error: "user_id is required in the payload to update." });
        }

        const rawSquad = squadId !== undefined ? squadId : restPayload.squad_id;
        const parsedSquad = rawSquad !== "" && rawSquad !== null && rawSquad !== undefined ? parseInt(rawSquad, 10) : null;

        const cleanPayload = {
            ...restPayload,
            user_id: user_id, 
            squad_id: Number.isNaN(parsedSquad) ? null : parsedSquad,
            personal_email: personalEmail !== undefined ? personalEmail : restPayload.personal_email || null,
            resume_url: resumeUrl !== undefined ? resumeUrl : restPayload.resume_url || null,
        };

        if (name !== undefined) cleanPayload.name = name;
        if (kalvium_email !== undefined || kalviumEmail !== undefined) {
            cleanPayload.kalvium_email = kalvium_email || kalviumEmail || null;
        }

        let { data, error: dbError } = await supabase
            .from("profiles")
            .update(cleanPayload)
            .eq("user_id", user_id)
            .select()
            .maybeSingle();

        if (!data && !dbError) {
            const insertResult = await supabase
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

// ==========================================
// 4. POST GitHub Profile Stats
// ==========================================
router.post("/github", statsRouteLimiter, async (req, res) => {
    const { url } = req.body;
    const username = extractUsername(url, "github");

    if (!username || !isValidGitHubUsername(username)) {
        return res.status(400).json({ error: "Invalid GitHub URL" });
    }

    try {
        const headers = { "User-Agent": "Student-Dashboard-App" };
        const [userRes, reposRes] = await Promise.all([
            fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, { headers }),
            fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=pushed&per_page=1`, { headers })
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

// ==========================================
// 5. POST LeetCode Profile Stats (Official GraphQL API)
// ==========================================
router.post("/leetcode", statsRouteLimiter, async (req, res) => {
    const { url } = req.body;
    const username = extractUsername(url, "leetcode");

    if (!username || !isValidLeetCodeUsername(username)) {
        return res.status(400).json({ error: "Invalid LeetCode URL" });
    }

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
            ranking: user.profile?.ranking || "N/A"
        });

    } catch (err) {
        console.error("LeetCode Fetch Error:", err);
        return res.status(500).json({ error: "Failed to fetch LeetCode data: " + err.message });
    }
});

export default router;