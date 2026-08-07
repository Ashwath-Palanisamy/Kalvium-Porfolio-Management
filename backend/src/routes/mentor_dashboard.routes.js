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
                squad_id: Number(squadId), // Ensured it matches integer type
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
        
        // Map kalvium_email to email for the frontend standard
        const mappedStudents = students ? students.map(s => ({
            ...s,
            email: s.kalvium_email || s.personal_email,
            id: s.user_id || s.id 
        })) : [];

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

        // Step 1: Fetch assignments directly without join to avoid PGRST200 error
        const { data: assignments, error: assignError } = await db
            .from("squad_students")
            .select("squad_id, student_user_id, assigned_at")
            .eq("mentor_user_id", mentorUserId);

        if (assignError) {
            console.error("Fetch Assigned Students Error:", assignError);
            return res.status(400).json({ error: assignError.message });
        }

        // Return early if no assignments
        if (!assignments || assignments.length === 0) {
            return res.status(200).json({ success: true, students: [] });
        }

        // Step 2: Extract User IDs and fetch the matching profiles
        const studentIds = assignments.map(a => a.student_user_id);
        
        const { data: profiles, error: profileError } = await db
            .from("profiles")
            .select("*")
            .in("user_id", studentIds);
            
        if (profileError) {
            console.error("Fetch Profiles Error:", profileError);
            return res.status(400).json({ error: profileError.message });
        }

        // Step 3: Combine the data and standardize column names for React
        const assignedStudents = assignments.map(assignment => {
            const profile = profiles?.find(p => p.user_id === assignment.student_user_id) || {};
            
            return {
                student_user_id: assignment.student_user_id,
                squad_id: assignment.squad_id,
                assigned_at: assignment.assigned_at,
                // Append profile mapping specifically handling JSON column names
                id: profile.user_id || assignment.student_user_id, 
                name: profile.name || "Unknown",
                email: profile.kalvium_email || profile.personal_email || "No email",
                avatar_url: profile.avatar_url || null
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