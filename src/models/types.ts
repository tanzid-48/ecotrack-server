import { ObjectId } from "mongodb";

// Daily activity log (for carbon footprint calculation)
export interface Activity {
  _id?: ObjectId;
  userId: string;
  date: string; // ISO date (YYYY-MM-DD)
  commuteType: "car" | "bus" | "bike" | "walk" | "train" | "motorbike";
  commuteDistanceKm: number;
  electricityUsageKwh: number;
  dietType: "vegan" | "vegetarian" | "mixed" | "heavy-meat";
  wasteKg: number;
  carbonFootprintKg: number; // calculated value
  createdAt: Date;
}

// Community sustainability tips/challenges (the "listing/card" section)
export interface Challenge {
  _id?: ObjectId;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: "energy" | "transport" | "food" | "waste" | "water";
  difficulty: "easy" | "medium" | "hard";
  impactScore: number; // estimated CO2 saved (kg/month)
  imageUrl?: string;
  createdBy: string; // userId
  participantsCount: number;
  rating: number;
  createdAt: Date;
}

// Users who joined a challenge
export interface ChallengeParticipation {
  _id?: ObjectId;
  challengeId: string;
  userId: string;
  status: "joined" | "completed" | "dropped";
  joinedAt: Date;
}

// Reviews on challenges
export interface Review {
  _id?: ObjectId;
  challengeId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}
