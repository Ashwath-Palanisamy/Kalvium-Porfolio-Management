import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import publicRoutes from "./routes/public.routes.js"
import dashboardRoutes from "./routes/student_dashboard.routes.js"
import mentorDashboardRoutes from "./routes/mentor_dashboard.routes.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8000


const envOrigins = (process.env.ORIGIN || "")
    .split(",")
    .map(url => url.trim().replace(/\/$/, ""))
    .filter(Boolean);

const allowedOrigins = [
    "http://localhost:5173",
    "https://kalvium-porfolio.vercel.app",
    ...envOrigins
];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            
            // Allow exact match or Vercel preview deployments
            if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
                return callback(null, true);
            }
            
            return callback(null, false);
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
)

app.options("*", cors())

app.use(express.json())

app.use("/public", publicRoutes)
app.use("/student/dashboard", dashboardRoutes)
app.use("/mentor/dashboard", mentorDashboardRoutes) 

app.get("/", (req, res) => {
    res.send("Backend is working")
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
