import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/db"



const app = express()

const PORT = 8000

app.get("/",(req,res) =>{
    res.send("Backend is working")
})

app.listen(PORT,()=>{
    console.log(`Server running of the port ${PORT}`)
})