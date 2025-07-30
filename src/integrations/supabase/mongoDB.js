import messageS from "./Models/Messages.js";
import mongoose from "mongoose";
import express from "express";
const app = express();
app.use(express.json());

app.listen(8081, () => {
  console.log("listening on PORT 8081");
});

app.get("/chat/:id", async (req, res) => {
  console.log("the id is ", req.params);
  try {
    const msg = await messageS.find({});
    res.status(200).json({ status: "✅", message: msg });
  } catch (error) {
    res.status(400).json({ status: "❌", error: error });
  }
});

app.post("/chat/:id", async (req, res) => {
  try {
    const messageToBeSaved = await messageS.create(req.body);

    res.status(200).json({ status: "✅", message: messageToBeSaved });
  } catch (error) {
    res.status(400).json({ status: "❌", error: error });
  }
});

// Enhanced MongoDB connection with better error handling
const connectDB = async () => {
  try {
    console.log("🔄 Attempting to connect to MongoDB...");

    // Connection options for better reliability
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    };

    const conn = await mongoose.connect(
      "mongodb+srv://quorumdev7:lkSZptof2lJav4TZ@cluster.jt9fb0z.mongodb.net/Chat?retryWrites=true&w=majority&appName=Cluster",
      options
    );

    console.log("✅ MongoDB connected successfully!");
    console.log(`📍 Host: ${conn.connection.host}`);
    console.log(`🗃️  Database: ${conn.connection.name}`);
    console.log(`🔌 Connection state: ${conn.connection.readyState}`);

    return conn;
  } catch (error) {
    console.log("❌ MongoDB connection failed!");
    console.log("🔍 Error details:", error.message);

    // More specific error messages
    if (error.message.includes("authentication")) {
      console.log("🔐 Authentication Error: Check your username and password");
    } else if (error.message.includes("network")) {
      console.log("🌐 Network Error: Check your internet connection");
    } else if (error.message.includes("timeout")) {
      console.log("⏰ Timeout Error: MongoDB server took too long to respond");
    } else if (error.message.includes("ENOTFOUND")) {
      console.log("🔍 DNS Error: Cannot find the MongoDB server");
    }

    console.log("💡 Troubleshooting tips:");
    console.log(
      "   1. Check MongoDB Atlas IP whitelist (add 0.0.0.0/0 for testing)"
    );
    console.log("   2. Verify username and password are correct");
    console.log("   3. Ensure cluster is running and accessible");
    console.log("   4. Check your internet connection");

    // Don't exit process in development
    // process.exit(1);
    return null;
  }
};

// Connection event listeners
mongoose.connection.on("connected", () => {
  console.log("🟢 Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.log("🔴 Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("🟡 Mongoose disconnected from MongoDB");
});

// Handle app termination
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("🔄 MongoDB connection closed due to app termination");
  process.exit(0);
});

// Execute the connection
connectDB();
