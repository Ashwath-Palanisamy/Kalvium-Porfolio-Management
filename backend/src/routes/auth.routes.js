import express from "express";
import { supabase } from "../config/supabase.js";

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

        // 2. Verify JWT token with Supabase
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({ error: "Invalid or expired token" });
        }

        req.user = user;

        // 3. Fetch profile using user.id against the 'user_id' UUID column
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", user.id)
            .single();

        if (error) throw error;

        return res.status(200).json(data);
    } catch (err) {
        return res.status(404).json({ error: "Profile not found or request failed: " + err.message });
    }
});

export default router;