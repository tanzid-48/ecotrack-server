import { Router, Response } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../config/db";
import { requireAuth, AuthRequest } from "../middleware/requireAuth";
import { Activity } from "../models/types";

const router = Router();

// Emission factors (kg CO2 per unit) — simplified reference values
const EMISSION_FACTORS = {
  commute: {
    car: 0.192,
    motorbike: 0.103,
    bus: 0.089,
    train: 0.041,
    bike: 0,
    walk: 0,
  },
  electricityPerKwh: 0.42,
  diet: {
    vegan: 1.5,
    vegetarian: 2.5,
    mixed: 4.0,
    "heavy-meat": 6.5,
  },
  wastePerKg: 0.58,
};

function calculateFootprint(input: {
  commuteType: keyof typeof EMISSION_FACTORS.commute;
  commuteDistanceKm: number;
  electricityUsageKwh: number;
  dietType: keyof typeof EMISSION_FACTORS.diet;
  wasteKg: number;
}): number {
  const commute =
    EMISSION_FACTORS.commute[input.commuteType] * input.commuteDistanceKm;
  const electricity =
    EMISSION_FACTORS.electricityPerKwh * input.electricityUsageKwh;
  const diet = EMISSION_FACTORS.diet[input.dietType];
  const waste = EMISSION_FACTORS.wastePerKg * input.wasteKg;

  return Math.round((commute + electricity + diet + waste) * 100) / 100;
}

// POST /api/activities — log a new daily activity
router.post("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const {
      date,
      commuteType,
      commuteDistanceKm,
      electricityUsageKwh,
      dietType,
      wasteKg,
    } = req.body;

    if (!date || !commuteType || !dietType) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const carbonFootprintKg = calculateFootprint({
      commuteType,
      commuteDistanceKm: Number(commuteDistanceKm) || 0,
      electricityUsageKwh: Number(electricityUsageKwh) || 0,
      dietType,
      wasteKg: Number(wasteKg) || 0,
    });

    const activity: Activity = {
      userId: req.userId as string,
      date,
      commuteType,
      commuteDistanceKm: Number(commuteDistanceKm) || 0,
      electricityUsageKwh: Number(electricityUsageKwh) || 0,
      dietType,
      wasteKg: Number(wasteKg) || 0,
      carbonFootprintKg,
      createdAt: new Date(),
    };

    const db = getDB();
    const result = await db.collection("activities").insertOne(activity);

    res.status(201).json({ ...activity, _id: result.insertedId });
  } catch (err) {
    console.error("Error logging activity:", err);
    res.status(500).json({ error: "Failed to log activity." });
  }
});

// GET /api/activities — fetch logged-in user's activities
router.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const activities = await db
      .collection("activities")
      .find({ userId: req.userId })
      .sort({ date: -1 })
      .toArray();

    res.json(activities);
  } catch (err) {
    console.error("Error fetching activities:", err);
    res.status(500).json({ error: "Failed to fetch activities." });
  }
});

// DELETE /api/activities/:id
router.delete("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const result = await db.collection("activities").deleteOne({
      _id: new ObjectId(req.params.id),
      userId: req.userId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Activity not found." });
    }

    res.json({ message: "Activity deleted." });
  } catch (err) {
    console.error("Error deleting activity:", err);
    res.status(500).json({ error: "Failed to delete activity." });
  }
});

export default router;
