import { Router, Response } from "express";
import { getDB } from "../config/db";
import { requireAuth, AuthRequest } from "../middleware/requireAuth";
import { callGroq, cleanJsonResponse } from "../lib/groq";

const router = Router();

// ── AI FEATURE 1: Data Analyzer ────────────────────────────────
// Analyzes the user's logged activities and returns trend/insight report
router.post(
  "/analyze-footprint",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const db = getDB();
      const activities = await db
        .collection("activities")
        .find({ userId: req.userId })
        .sort({ date: 1 })
        .toArray();

      if (activities.length === 0) {
        return res.status(400).json({
          error: "No activity data logged yet. Add some daily logs first.",
        });
      }

      const summaryData = activities.map((a) => ({
        date: a.date,
        commuteType: a.commuteType,
        commuteDistanceKm: a.commuteDistanceKm,
        electricityUsageKwh: a.electricityUsageKwh,
        dietType: a.dietType,
        wasteKg: a.wasteKg,
        carbonFootprintKg: a.carbonFootprintKg,
      }));

      const prompt = `You are a sustainability data analyst. Analyze this user's daily carbon footprint activity log (JSON below) and produce a report.

Activity log:
${JSON.stringify(summaryData)}

Respond ONLY with valid JSON (no markdown, no preamble) in this exact shape:
{
  "totalFootprintKg": number,
  "averageDailyKg": number,
  "trend": "increasing" | "decreasing" | "stable",
  "biggestContributor": "commute" | "electricity" | "diet" | "waste",
  "summary": "2-3 sentence plain-language summary of their footprint pattern",
  "insights": ["insight 1", "insight 2", "insight 3"]
}`;

      const raw = await callGroq(prompt);
      const parsed = JSON.parse(cleanJsonResponse(raw));

      res.json(parsed);
    } catch (err) {
      console.error("Error analyzing footprint:", err);
      res.status(500).json({ error: "Failed to analyze footprint data." });
    }
  }
);

// ── AI FEATURE 2: Smart Recommendation Engine ──────────────────
// Recommends personalized sustainability tips + challenges based on user data
router.post(
  "/recommend",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const db = getDB();
      const { categoryFilter } = req.body;

      const activities = await db
        .collection("activities")
        .find({ userId: req.userId })
        .sort({ date: -1 })
        .limit(14)
        .toArray();

      const challengeQuery: Record<string, unknown> = {};
      if (categoryFilter) challengeQuery.category = categoryFilter;

      const availableChallenges = await db
        .collection("challenges")
        .find(challengeQuery)
        .limit(20)
        .toArray();

      if (activities.length === 0) {
        return res.status(400).json({
          error: "No activity data logged yet. Add some daily logs first.",
        });
      }

      const prompt = `You are a sustainability recommendation engine. Based on the user's recent activity log and the list of available community challenges, recommend the best next steps.

Recent activities:
${JSON.stringify(
  activities.map((a) => ({
    commuteType: a.commuteType,
    dietType: a.dietType,
    electricityUsageKwh: a.electricityUsageKwh,
    carbonFootprintKg: a.carbonFootprintKg,
  }))
)}

Available challenges (id, title, category):
${JSON.stringify(
  availableChallenges.map((c) => ({
    id: c._id,
    title: c.title,
    category: c.category,
  }))
)}

Respond ONLY with valid JSON (no markdown, no preamble) in this exact shape:
{
  "personalizedTips": ["tip 1", "tip 2", "tip 3"],
  "recommendedChallengeIds": ["id1", "id2", "id3"],
  "reasoning": "1-2 sentence explanation of why these were recommended"
}`;

      const raw = await callGroq(prompt);
      const parsed = JSON.parse(cleanJsonResponse(raw));

      res.json(parsed);
    } catch (err) {
      console.error("Error generating recommendations:", err);
      res.status(500).json({ error: "Failed to generate recommendations." });
    }
  }
);

// AI Content Generator helper — used on the Add Challenge form
router.post(
  "/generate-challenge-description",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const { title, category, keyPoints } = req.body;

      if (!title || !category) {
        return res.status(400).json({ error: "Title and category are required." });
      }

      const prompt = `Write a compelling short description (1-2 sentences) and a full description (3-4 sentences) for a sustainability challenge titled "${title}" in the category "${category}". Key points to include: ${keyPoints || "none specified"}.

Respond ONLY with valid JSON (no markdown) in this shape:
{
  "shortDescription": "...",
  "fullDescription": "..."
}`;

      const raw = await callGroq(prompt);
      const parsed = JSON.parse(cleanJsonResponse(raw));

      res.json(parsed);
    } catch (err) {
      console.error("Error generating description:", err);
      res.status(500).json({ error: "Failed to generate description." });
    }
  }
);

export default router;
