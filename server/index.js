import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import http from "http"
import { Server } from "socket.io"
import { seedDatabase } from "./seed.js"

// Import routes
import authRoutes from "./routes/authRoutes.js"
import alertRoutes from "./routes/alertRoutes.js"
import userRoutes from "./routes/userRoutes.js"

// Load environment variables
dotenv.config()

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/disaster-alerts")
  .then(() => {
    console.log("Connected to MongoDB")
    // Seed the database with mock data if it's empty
    seedDatabase()
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err)
  })

// Socket.io connection
io.on("connection", (socket) => {
  console.log("New client connected")

  // Join a room based on location
  socket.on("join-location", (data) => {
    const { lat, lng } = data
    // Create a location-based room (simplified for demo)
    const locationRoom = `${Math.floor(lat)}_${Math.floor(lng)}`
    socket.join(locationRoom)
    console.log(`Client joined room: ${locationRoom}`)
  })

  // Admin creates a new alert
  socket.on("new-alert", (alert) => {
    // Broadcast to all connected clients
    io.emit("alert-update", alert)
    console.log("New alert broadcast to all clients")
  })

  socket.on("disconnect", () => {
    console.log("Client disconnected")
  })
})

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/alerts", alertRoutes)
app.use("/api/users", userRoutes)

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

console.log("Disaster Alert System API is running")
