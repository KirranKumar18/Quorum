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

server.listen(5000, () => {
  console.log("Server with socket.io running on http://localhost:5000");
});
