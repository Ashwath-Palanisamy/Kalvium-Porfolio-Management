import express from "express";
import { createAuthedSupabaseClient, supabase } from "../config/supabase.js";

const router = express.Router();

// Public route test
router.get("/", (req, res) => {
    res.json({
        message: "User route working"
    });
});

router.get("/profile", async (req, res) => {
    try {
        // 1. Extract Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Missing or invalid Authorization header" });
        }

        const token = authHeader.split(" ")[1];
        const authedSupabase = createAuthedSupabaseClient(token);

        // 2. Verify JWT token with Supabase
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({ error: "Invalid or expired token" });
        }

        req.user = user;

        // 3. Fetch profile using a request-scoped client so RLS sees the JWT
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

        // 1. Authenticate user using token
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) {
            return res.status(401).json({ error: "Invalid or expired token" });
        }

        const updatePayload = req.body;
        if (!updatePayload || Object.keys(updatePayload).length === 0) {
            return res.status(400).json({ error: "No profile data provided to update." });
        }

        // 2. Destructure and strip immutable/duplicate fields
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
            user_id: user.id, // Must match auth.uid()
            squad_id: Number.isNaN(parsedSquad) ? null : parsedSquad,
            personal_email: personalEmail !== undefined ? personalEmail : restPayload.personal_email || null,
            resume_url: resumeUrl !== undefined ? resumeUrl : restPayload.resume_url || null,
        };

        // 2. Perform UPDATE first with a request-scoped client so PostgREST enforces the user JWT
        let { data, error: dbError } = await authedSupabase
            .from("profiles")
            .update(cleanPayload)
            .eq("user_id", user.id)
            .select()
            .maybeSingle();

        // 3. If no row exists yet, perform INSERT with the same authed client
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


export default router;