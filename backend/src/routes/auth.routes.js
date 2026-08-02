import express from "express";
import { createAuthedSupabaseClient, supabase } from "../config/supabase.js";

const router = express.Router();

// Public route test
router.get("/", (req, res) => {
    res.json({
        message: "User route working"
    });
});



export default router;