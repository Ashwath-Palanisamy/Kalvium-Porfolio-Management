import express from "express"
import dotenv from "dotenv"
import cors from "cors"

import connectDB from "./config/db.js"
import authRoutes from "./routes/auth.routes.js"


dotenv.config()

const app = express()

const PORT = process.env.PORT || 8000


// Allow React frontend
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true
    })
)


app.use(express.json())


connectDB()


app.use("/api/auth", authRoutes)


app.get("/",(req,res)=>{
    res.send("Backend is working")
})


app.listen(PORT,()=>{
    console.log(`Server running on http://localhost:${PORT}`)
})