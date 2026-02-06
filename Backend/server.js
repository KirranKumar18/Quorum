import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import router from "./Routes/routes.js";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();
const server = http.createServer(app); //   wrap Express app with HTTP server

const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for development
    methods: ["GET", "POST"],
  },
});

app.use(express.json()); // makes it ez to parse json from POST req        [ middleware ]
app.use(cors());

connectDB();

app.use("/api", router);

// ✅ Root route - Health check for Render and browser visits
app.get("/", (req, res) => {
  res.status(200).json({
    status: "✅ Server is running!",
    message: "Quorum Backend API",
    endpoints: {
      api: "/api",
      health: "/health",
      socket: "Socket.io connection available",
    },
    timestamp: new Date().toISOString(),
  });
});

// ✅ Health check endpoint (best practice for production)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

//  socket.io logic
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Listen for newMessage events and broadcast to all clients
  socket.on("newMessage", (message) => {
    console.log("📨 New message received:", message);
    // Broadcast to all clients INCLUDING the sender
    io.emit("newMessage", message);
  });

  // Join a specific group room
  socket.on("joinGroup", (groupId) => {
    socket.join(groupId);
    console.log(`👥 Socket ${socket.id} joined group: ${groupId}`);
  });

  // Leave a group room
  socket.on("leaveGroup", (groupId) => {
    socket.leave(groupId);
    console.log(`👋 Socket ${socket.id} left group: ${groupId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// make io accessible to routes if needed
app.set("io", io);

// ✅ Use Render's PORT or fallback to 5000 for local development
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`✅ Server with Socket.io running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
});
