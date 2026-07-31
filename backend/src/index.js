import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import authRoutes from "./routes/auth.routes.js"

dotenv.config()

const app = express()

const PORT = process.env.PORT || 8000

// Middleware
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true
    })
)

app.use(express.json())

// Mount your auth routes
app.use("/api/auth", authRoutes)

// Health check route
app.get("/", (req, res) => {
    res.send("Backend is working")
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})