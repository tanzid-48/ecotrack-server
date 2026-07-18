import { Router, Response } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../config/db";
import { requireAuth, AuthRequest } from "../middleware/requireAuth";
import { Challenge } from "../models/types";

const router = Router();

// GET /api/challenges — list with search, filter (category, difficulty), sort, pagination
router.get("/", async (req, res: Response) => {
  try {
    const db = getDB();
    const {
      search = "",
      category,
      difficulty,
      sort = "newest",
      page = "1",
      limit = "8",
    } = req.query as Record<string, string>;

    const query: Record<string, unknown> = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { shortDescription: { $regex: search, $options: "i" } },
      ];
    }
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      newest: { createdAt: -1 },
      impact: { impactScore: -1 },
      rating: { rating: -1 },
    };
    const sortQuery = sortMap[sort] || sortMap.newest;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const collection = db.collection("challenges");
    const [items, total] = await Promise.all([
      collection.find(query).sort(sortQuery).skip(skip).limit(limitNum).toArray(),
      collection.countDocuments(query),
    ]);

    res.json({
      items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("Error fetching challenges:", err);
    res.status(500).json({ error: "Failed to fetch challenges." });
  }
});

// GET /api/challenges/:id — details page (public)
router.get("/:id", async (req, res: Response) => {
  try {
    const db = getDB();
    const challenge = await db
      .collection("challenges")
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!challenge) {
      return res.status(404).json({ error: "Challenge not found." });
    }

    const related = await db
      .collection("challenges")
      .find({ category: challenge.category, _id: { $ne: challenge._id } })
      .limit(4)
      .toArray();

    const reviews = await db
      .collection("reviews")
      .find({ challengeId: req.params.id })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({ challenge, related, reviews });
  } catch (err) {
    console.error("Error fetching challenge details:", err);
    res.status(500).json({ error: "Failed to fetch challenge." });
  }
});

// POST /api/challenges — create (protected)
router.post("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      shortDescription,
      fullDescription,
      category,
      difficulty,
      impactScore,
      imageUrl,
    } = req.body;

    if (!title || !shortDescription || !fullDescription || !category) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const challenge: Challenge = {
      title,
      shortDescription,
      fullDescription,
      category,
      difficulty: difficulty || "easy",
      impactScore: Number(impactScore) || 0,
      imageUrl,
      createdBy: req.userId as string,
      participantsCount: 0,
      rating: 0,
      createdAt: new Date(),
    };

    const db = getDB();
    const result = await db.collection("challenges").insertOne(challenge);

    res.status(201).json({ ...challenge, _id: result.insertedId });
  } catch (err) {
    console.error("Error creating challenge:", err);
    res.status(500).json({ error: "Failed to create challenge." });
  }
});

// GET /api/challenges/mine/list — challenges created by logged-in user (manage page)
router.get(
  "/mine/list",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const db = getDB();
      const items = await db
        .collection("challenges")
        .find({ createdBy: req.userId })
        .sort({ createdAt: -1 })
        .toArray();

      res.json(items);
    } catch (err) {
      console.error("Error fetching user's challenges:", err);
      res.status(500).json({ error: "Failed to fetch your challenges." });
    }
  }
);

// DELETE /api/challenges/:id — protected, only own challenge
router.delete(
  "/:id",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const db = getDB();
      const result = await db.collection("challenges").deleteOne({
        _id: new ObjectId(req.params.id),
        createdBy: req.userId,
      });

      if (result.deletedCount === 0) {
        return res
          .status(404)
          .json({ error: "Challenge not found or not owned by you." });
      }

      res.json({ message: "Challenge deleted." });
    } catch (err) {
      console.error("Error deleting challenge:", err);
      res.status(500).json({ error: "Failed to delete challenge." });
    }
  }
);

// POST /api/challenges/:id/join — protected
router.post(
  "/:id/join",
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const db = getDB();
      const challengeId = req.params.id;

      const existing = await db
        .collection("challengeParticipations")
        .findOne({ challengeId, userId: req.userId });

      if (existing) {
        return res.status(400).json({ error: "Already joined this challenge." });
      }

      await db.collection("challengeParticipations").insertOne({
        challengeId,
        userId: req.userId,
        status: "joined",
        joinedAt: new Date(),
      });

      await db
        .collection("challenges")
        .updateOne(
          { _id: new ObjectId(challengeId) },
          { $inc: { participantsCount: 1 } }
        );

      res.json({ message: "Joined challenge successfully." });
    } catch (err) {
      console.error("Error joining challenge:", err);
      res.status(500).json({ error: "Failed to join challenge." });
    }
  }
);

export default router;
