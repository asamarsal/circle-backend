import express from "express";
import authRoute from "./routes/auth";
import threadRoute from "./routes/thread";
import replyRoute from "./routes/reply";
import profileRoute from "./routes/profile";
import likeRoute from "./routes/like";
import followRoute from "./routes/follow";

import searchRoute from "./routes/search";

import { corsMiddleware } from "./middlewares/cors";

import { createServer } from "http";
import { Server } from "socket.io";

import path from "path";

const app = express();

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "https://circle-app-chba.vercel.app/"],
    credentials: true,
    methods: ["GET", "POST"]
  }
});

// Siapa saja yang online
const onlineUsers = new Map();

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("userConnected", (userData) => {
    console.log("User connected:", userData);
    onlineUsers.set(userData.userId, {
      socketId: socket.id,
      ...userData
    });
    // update list user yang online
    io.emit("onlineUsers", Array.from(onlineUsers.values()));
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected");

    for (const [userId, user] of onlineUsers.entries()) {
      if (user.socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    // Broadcast updated online users list
    io.emit("onlineUsers", Array.from(onlineUsers.values()));
  });
});

app.set('io', io);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(corsMiddleware);

// Group Route
app.use("/api/v1/auth/", authRoute);
app.use("/api/v1/thread/", threadRoute);
app.use("/api/v1/reply", replyRoute);
app.use("/api/v1/profile", profileRoute);
app.use("/api/v1/like", likeRoute);
app.use("/api/v1/follows", followRoute);

app.use("/api/v1/search", searchRoute);

app.use('/uploads', express.static(path.join(__dirname, '..', 'src', 'uploads')));

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT} ✅`);
});