import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load .env.local explicitly
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env.local") });

import express from "express";
import cors from "cors";
import http from "http";
import { WebSocketServer } from "ws";
import { connectDB } from "./utils/db.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.js";
import predictionsRoutes from "./routes/predictions.js";
import leaderboardRoutes from "./routes/leaderboard.js";
import adminRoutes from "./routes/admin.js";
import discussionsRoutes from "./routes/discussions.js";
import driversRoutes from "./routes/drivers.js";
import openF1Routes from "./routes/openf1.js";
import { Driver } from "./models/Driver.js";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const PORT = process.env.PORT || 3000;

// WebSocket connection management
interface ClientInfo {
  userId: string;
  discussionId: string;
}

const clients = new Map<any, ClientInfo>();

wss.on("connection", (ws) => {
  console.log("New WebSocket connection");

  ws.on("message", (data: string) => {
    try {
      const message = JSON.parse(data);
      
      if (message.type === "join") {
        // User joins a discussion room
        clients.set(ws, { userId: message.userId, discussionId: message.discussionId });
        
        // Notify others in the same discussion
        broadcastToDiscussion(message.discussionId, {
          type: "user-joined",
          userId: message.userId,
          userName: message.userName,
        }, ws);
      } else if (message.type === "message") {
        // Broadcast message to all clients in the same discussion
        broadcastToDiscussion(clients.get(ws)?.discussionId || "", {
          type: "new-message",
          messageId: message.messageId,
          discussionId: clients.get(ws)?.discussionId,
          userId: message.userId,
          userName: message.userName,
          content: message.content,
          timestamp: new Date(),
        });
      } else if (message.type === "poll-vote") {
        // Broadcast poll update to all clients in the same discussion
        broadcastToDiscussion(clients.get(ws)?.discussionId || "", {
          type: "poll-updated",
          pollId: message.pollId,
          voteCounts: message.voteCounts,
        });
      }
    } catch (error) {
      console.error("WebSocket message error:", error);
    }
  });

  ws.on("close", () => {
    const clientInfo = clients.get(ws);
    if (clientInfo) {
      // Notify others that user left
      broadcastToDiscussion(clientInfo.discussionId, {
        type: "user-left",
        userId: clientInfo.userId,
      });
      clients.delete(ws);
    }
  });
});

function broadcastToDiscussion(discussionId: string, message: any, exclude?: any) {
  clients.forEach((clientInfo, client) => {
    if (clientInfo.discussionId === discussionId && client !== exclude && client.readyState === 1) {
      client.send(JSON.stringify(message));
    }
  });
}

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:8080",
    "http://localhost:8081",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:8081",
    "https://f1-predictor-pro-six.vercel.app",
    "https://f1predict.dev",
    "https://www.f1predict.dev"
  ],
  credentials: true,
}));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/predictions", predictionsRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/discussions", discussionsRoutes);
app.use("/api/drivers", driversRoutes);
app.use("/api/openf1", openF1Routes);

// Health check
app.get("/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// Start server
async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();

    // Ensure drivers are seeded initially
    await Driver.seedIfEmpty();

    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🔌 WebSocket available at ws://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
