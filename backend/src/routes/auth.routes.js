import express from "express";
import { googleLogin } from "../controllers/auth.controller.js";

const router = express.Router()

router.get("/",(req, res) => {
    res.send("Auth is Working");
})

router.post("/google", googleLogin)

export default router;