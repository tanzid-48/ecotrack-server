import { Router, Response } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../config/db";
import { requireAuth, AuthRequest } from "../middleware/requireAuth";

const router = Router();

// POST /api/reviews — add or update a review (protected, one review per user per challenge)
router.post("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { challengeId, rating, comment } = req.body;

    if (!challengeId || !rating) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const db = getDB();

    // One review per user per challenge — update if it already exists instead of duplicating
    await db.collection("reviews").updateOne(
      { challengeId, userId: req.userId as string },
      {
        $set: {
          challengeId,
          userId: req.userId as string,
          rating: Number(rating),
          comment: comment || "",
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );

    // Recalculate average rating on the challenge
    const allReviews = await db
      .collection("reviews")
      .find({ challengeId })
      .toArray();
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await db
      .collection("challenges")
      .updateOne(
        { _id: new ObjectId(challengeId) },
        { $set: { rating: Math.round(avgRating * 10) / 10 } }
      );

    res.status(201).json({ message: "Review saved." });
  } catch (err) {
    console.error("Error adding review:", err);
    res.status(500).json({ error: "Failed to add review." });
  }
});

export default router;
