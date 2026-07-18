import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { toNodeHandler } from "better-auth/node";
import { connectDB } from "./config/db";
import { initAuth, auth } from "./lib/auth";
import activityRoutes from "./routes/activities";
import challengeRoutes from "./routes/challenges";
import reviewRoutes from "./routes/reviews";
import aiRoutes from "./routes/ai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Render (and similar hosts) terminate TLS at a proxy in front of the app.
// Without this, Express can't tell the connection is HTTPS, which breaks
// Secure/SameSite=None cookies needed for cross-domain OAuth.
app.set("trust proxy", 1);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

async function startServer() {
  try {
    await connectDB();
    initAuth();

    // BetterAuth handler must be mounted BEFORE express.json()
    app.all("/api/auth/*", toNodeHandler(auth));

    app.use(express.json());

    app.get("/api/health", (_req, res) => {
      res.json({ status: "ok", message: "EcoTrack server running" });
    });

    app.use("/api/activities", activityRoutes);
    app.use("/api/challenges", challengeRoutes);
    app.use("/api/reviews", reviewRoutes);
    app.use("/api/ai", aiRoutes);

    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
