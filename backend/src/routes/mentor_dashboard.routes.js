import express from "express";
import rateLimit from "express-rate-limit";
import { createAuthedSupabaseClient, supabase } from "../config/supabase.js";

const router = express.Router();

const saveSquadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: "Too many requests. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Unauthorized: Missing token" });
        }

        const token = authHeader.split(" ")[1];

        // Verify token using imported supabase client
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: "Unauthorized: Invalid token" });
        }

        req.user = user;
        // Attach authed client so queries run with the user's RLS context
        req.authedSupabase = createAuthedSupabaseClient(token);
        next();
    } catch (err) {
        return res.status(401).json({ error: "Authentication failed" });
    }
};

// ==========================================
// HELPER: NORMALIZE STUDENT ACTIVITY FIELDS
// ==========================================
const normalizeStudentActivity = (profile = {}) => {
    const rawActive =
        profile.is_leetcode_active ??
        profile.leetcode_active ??
        profile.is_active ??
        profile.active;

    const rawLastSolved =
        profile.last_solved_at ??
        profile.leetcode_last_solved_at ??
        profile.last_solved ??
        profile.last_active_at ??
        profile.updated_at;

    const rawTotalSolved =
        profile.total_solved ??
        profile.totalSolved ??
        profile.leetcode_total_solved ??
        profile.solved_count ??
        0;

    const totalSolved = Number(rawTotalSolved) || 0;
    const hasSolvedProblems = totalSolved > 0;

    let isActive = false;
    if (
        (rawActive === true || rawActive === 1 || rawActive === "true" || rawActive === "1") &&
        hasSolvedProblems
    ) {
        isActive = true;
    } else if (hasSolvedProblems && rawLastSolved) {
        const solvedDate = new Date(rawLastSolved);
        if (!isNaN(solvedDate.getTime())) {
            const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
            isActive = solvedDate.getTime() >= sevenDaysAgo;
        }
    }

    return {
        ...profile,
        id: profile.user_id || profile.id,
        student_user_id: profile.user_id || profile.student_user_id || profile.id,
        name: profile.name || "Unknown",
        email: profile.kalvium_email || profile.personal_email || profile.email || "No email",
        avatar_url: profile.avatar_url || null,
        is_leetcode_active: isActive,
        total_solved: totalSolved,
        last_solved_at: hasSolvedProblems ? rawLastSolved || null : null,
        leetcode: profile.leetcode || profile.leetcode_username || profile.leetcode_handle || null,
        github: profile.github || profile.github_username || profile.github_handle || null,
        linkedin: profile.linkedin || profile.linkedin_url || null,
    };
};

// Helper: Build a lookup map from leetcode_leaderboard data
const createLeaderboardMap = (leaderboardRows = []) => {
    const map = new Map();
    leaderboardRows.forEach((row) => {
        if (row.user_id) map.set(String(row.user_id), row);
        if (row.profile_id) map.set(String(row.profile_id), row);
    });
    return map;
};

// ==========================================
// SQUAD MANAGEMENT ROUTES (mentor_squads)
// ==========================================

router.get("/getsquads", requireAuth, async (req, res) => {
    try {
        const mentorUserId = req.user.id;
        const db = req.authedSupabase;

        const { data, error } = await db
            .from("mentor_squads")
            .select("squad_id")
            .eq("mentor_user_id", mentorUserId);

        if (error) {
            console.error("Fetch Squads Error:", error);
            return res.status(400).json({ error: error.message });
        }

        const squads = data ? data.map((item) => item.squad_id) : [];

        return res.status(200).json({
            success: true,
            squads,
        });
    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/savesquad", saveSquadLimiter, requireAuth, async (req, res) => {
    try {
        const mentorUserId = req.user.id;
        const { squads } = req.body;

        if (!squads) {
            return res.status(400).json({ error: "Squads field is required" });
        }

        const squadList = Array.isArray(squads) ? squads : [squads];
        const db = req.authedSupabase;

        const { error: deleteError } = await db
            .from("mentor_squads")
            .delete()
            .eq("mentor_user_id", mentorUserId);

        if (deleteError) {
            console.error("Delete Error:", deleteError);
            return res.status(400).json({ error: deleteError.message });
        }

        if (squadList.length > 0) {
            const recordsToInsert = squadList.map((squadId) => ({
                mentor_user_id: mentorUserId,
                squad_id: Number(squadId),
            }));

            const { data, error: insertError } = await db
                .from("mentor_squads")
                .insert(recordsToInsert)
                .select();

            if (insertError) {
                console.error("Insert Error:", insertError);
                return res.status(400).json({ error: insertError.message });
            }

            return res.status(200).json({ success: true, message: "Squads saved successfully", data });
        }

        return res.status(200).json({ success: true, message: "All squad assignments cleared", data: [] });
    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/students", requireAuth, async (req, res) => {
    try {
        const mentorUserId = req.user.id;
        const db = req.authedSupabase;
        const requestedSquadId = req.query.squad_id;

        const { data: mentorSquads, error: squadError } = await db
            .from("mentor_squads")
            .select("squad_id")
            .eq("mentor_user_id", mentorUserId);

        if (squadError) {
            console.error("Fetch Mentor Squads Error:", squadError);
            return res.status(400).json({ error: squadError.message });
        }

        const assignedSquadIds = mentorSquads ? mentorSquads.map((s) => String(s.squad_id)) : [];

        if (assignedSquadIds.length === 0) {
            return res.status(200).json({ success: true, count: 0, students: [] });
        }

        let query = db.from("profiles").select("*");

        if (requestedSquadId) {
            const requestedStr = String(requestedSquadId);
            if (!assignedSquadIds.includes(requestedStr)) {
                return res.status(403).json({ error: "Forbidden: You are not assigned to this squad" });
            }
            query = query.eq("squad_id", requestedStr);
        } else {
            query = query.in("squad_id", assignedSquadIds);
        }

        const { data: students, error: studentError } = await query;

        if (studentError) {
            console.error("Fetch Students Error:", studentError);
            return res.status(400).json({ error: studentError.message });
        }

        // Fetch matching LeetCode activity stats from leetcode_leaderboard
        const studentUserIds = students ? students.map((s) => s.user_id || s.id).filter(Boolean) : [];
        const { data: leaderboardData } = await db
            .from("leetcode_leaderboard")
            .select("*")
            .in("user_id", studentUserIds);

        const leaderboardMap = createLeaderboardMap(leaderboardData);

        // Merge profile info with leaderboard stats and normalize
        const mappedStudents = students
            ? students.map((s) => {
                  const stats =
                      leaderboardMap.get(String(s.user_id)) ||
                      leaderboardMap.get(String(s.id)) ||
                      {};
                  return normalizeStudentActivity({ ...s, ...stats });
              })
            : [];

        return res.status(200).json({
            success: true,
            count: mappedStudents.length,
            students: mappedStudents,
        });
    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// ==========================================
// INDIVIDUAL STUDENT ROUTES (squad_students)
// ==========================================

router.get("/assigned-students", requireAuth, async (req, res) => {
    try {
        const mentorUserId = req.user.id;
        const db = req.authedSupabase;

        // Step 1: Fetch assignments directly
        const { data: assignments, error: assignError } = await db
            .from("squad_students")
            .select("squad_id, student_user_id, assigned_at")
            .eq("mentor_user_id", mentorUserId);

        if (assignError) {
            console.error("Fetch Assigned Students Error:", assignError);
            return res.status(400).json({ error: assignError.message });
        }

        if (!assignments || assignments.length === 0) {
            return res.status(200).json({ success: true, students: [] });
        }

        // Step 2: Extract User IDs and fetch profiles
        const studentIds = assignments.map((a) => a.student_user_id);

        const { data: profiles, error: profileError } = await db
            .from("profiles")
            .select("*")
            .in("user_id", studentIds);

        if (profileError) {
            console.error("Fetch Profiles Error:", profileError);
            return res.status(400).json({ error: profileError.message });
        }

        // Step 3: Fetch activity stats from leetcode_leaderboard
        const { data: leaderboardData } = await db
            .from("leetcode_leaderboard")
            .select("*")
            .in("user_id", studentIds);

        const leaderboardMap = createLeaderboardMap(leaderboardData);

        // Step 4: Merge profiles + leaderboard stats and normalize
        const assignedStudents = assignments.map((assignment) => {
            const profile =
                profiles?.find((p) => String(p.user_id) === String(assignment.student_user_id)) || {};
            const stats =
                leaderboardMap.get(String(assignment.student_user_id)) ||
                leaderboardMap.get(String(profile.id)) ||
                {};

            const mergedData = { ...profile, ...stats };
            const normalized = normalizeStudentActivity(mergedData);

            return {
                ...normalized,
                student_user_id: assignment.student_user_id,
                squad_id: assignment.squad_id || profile.squad_id,
                assigned_at: assignment.assigned_at,
            };
        });

        return res.status(200).json({
            success: true,
            students: assignedStudents,
        });
    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/student-stats/:studentUserId", requireAuth, async (req, res) => {
    try {
        const { studentUserId } = req.params;
        const db = req.authedSupabase;

        const [profileRes, statsRes] = await Promise.all([
            db.from("profiles").select("*").eq("user_id", studentUserId).single(),
            db.from("leetcode_leaderboard").select("*").eq("user_id", studentUserId).maybeSingle(),
        ]);

        if (profileRes.error || !profileRes.data) {
            return res.status(404).json({ error: "Student profile not found" });
        }

        const mergedData = { ...profileRes.data, ...(statsRes.data || {}) };
        const normalized = normalizeStudentActivity(mergedData);

        return res.status(200).json({ success: true, student: normalized });
    } catch (error) {
        console.error("Fetch Student Stats Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/assign-student", requireAuth, async (req, res) => {
    try {
        const mentorUserId = req.user.id;
        const { student_user_id, squad_id } = req.body;
        const db = req.authedSupabase;

        if (!student_user_id) {
            return res.status(400).json({ error: "student_user_id is required" });
        }

        const { data, error } = await db
            .from("squad_students")
            .insert([{
                mentor_user_id: mentorUserId,
                student_user_id: student_user_id,
                squad_id: squad_id ? Number(squad_id) : null
            }])
            .select();

        if (error) {
            console.error("Assign Student Error:", error);
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ success: true, message: "Student assigned successfully", data });
    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/unassign-student", requireAuth, async (req, res) => {
    try {
        const mentorUserId = req.user.id;
        const { student_user_id } = req.body;
        const db = req.authedSupabase;

        if (!student_user_id) {
            return res.status(400).json({ error: "student_user_id is required" });
        }

        const { error } = await db
            .from("squad_students")
            .delete()
            .match({ 
                mentor_user_id: mentorUserId, 
                student_user_id: student_user_id 
            });

        if (error) {
            console.error("Unassign Student Error:", error);
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({ success: true, message: "Student unassigned successfully" });
    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

export default router;