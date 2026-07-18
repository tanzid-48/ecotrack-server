import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI as string;
const dbName = process.env.DB_NAME || "ecotrack";

const challenges = [
  {
    title: "Bike to work twice a week",
    shortDescription:
      "Swap two weekly car commutes for a bike ride and cut transport emissions fast.",
    fullDescription:
      "Commuting is one of the largest contributors to an individual's carbon footprint. This challenge asks you to replace your car commute with a bicycle at least twice a week for a month. Track your distance and watch your transport emissions drop in your dashboard.",
    category: "transport",
    difficulty: "easy",
    impactScore: 18,
    imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800",
    createdBy: "seed",
    participantsCount: 34,
    rating: 4.6,
    createdAt: new Date(),
  },
  {
    title: "Switch to LED lighting at home",
    shortDescription:
      "Replace incandescent or CFL bulbs with LEDs across your home this month.",
    fullDescription:
      "LED bulbs use up to 80% less energy than traditional incandescent bulbs and last significantly longer. This challenge walks you through auditing your home's lighting and replacing high-usage fixtures first for the fastest payback.",
    category: "energy",
    difficulty: "easy",
    impactScore: 9,
    imageUrl: "https://images.unsplash.com/photo-1550985616-10810253b84d?w=800",
    createdBy: "seed",
    participantsCount: 58,
    rating: 4.8,
    createdAt: new Date(),
  },
  {
    title: "Three meat-free days a week",
    shortDescription:
      "Cut red meat from three days a week and shift toward plant-based meals.",
    fullDescription:
      "Diet is one of the biggest levers for reducing personal emissions. This challenge doesn't ask you to go fully vegetarian — just commit to three meat-free days a week, tracked through your daily log, and let the AI recommendation engine suggest realistic swaps.",
    category: "food",
    difficulty: "medium",
    impactScore: 22,
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800",
    createdBy: "seed",
    participantsCount: 71,
    rating: 4.5,
    createdAt: new Date(),
  },
  {
    title: "Start a home compost bin",
    shortDescription:
      "Divert food scraps from landfill by starting a simple compost system.",
    fullDescription:
      "Composting keeps organic waste out of landfills, where it produces methane. This challenge guides you through setting up a small compost bin, what can and can't go in it, and how to track your waste reduction over the following weeks.",
    category: "waste",
    difficulty: "medium",
    impactScore: 14,
    imageUrl: "https://images.unsplash.com/photo-1542601098-3adb3893f596?w=800",
    createdBy: "seed",
    participantsCount: 27,
    rating: 4.4,
    createdAt: new Date(),
  },
  {
    title: "Fix household water leaks",
    shortDescription:
      "Audit taps and pipes for leaks and get them fixed within two weeks.",
    fullDescription:
      "A single dripping tap can waste thousands of liters a year. This challenge asks you to inspect every tap, toilet, and visible pipe in your home, note any leaks, and get them repaired — tracking the water saved afterward.",
    category: "water",
    difficulty: "easy",
    impactScore: 7,
    imageUrl: "https://images.unsplash.com/photo-1585321523631-3e63fd8e2f8e?w=800",
    createdBy: "seed",
    participantsCount: 19,
    rating: 4.3,
    createdAt: new Date(),
  },
  {
    title: "One car-free week",
    shortDescription:
      "Go a full week using only walking, cycling, or public transit.",
    fullDescription:
      "A harder version of the commute challenge — no car use at all for seven full days, for any trip. This is one of the highest-impact short-term challenges available, and pairs well with the AI footprint analyzer to show the dramatic weekly difference.",
    category: "transport",
    difficulty: "hard",
    impactScore: 40,
    imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800",
    createdBy: "seed",
    participantsCount: 12,
    rating: 4.7,
    createdAt: new Date(),
  },
  {
    title: "Unplug idle electronics daily",
    shortDescription:
      "Cut phantom power load by unplugging devices you're not actively using.",
    fullDescription:
      "Many electronics draw power even when switched off. This challenge asks you to unplug chargers, TVs, and idle appliances each night for a month, and log your electricity usage to see the drop.",
    category: "energy",
    difficulty: "easy",
    impactScore: 6,
    imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800",
    createdBy: "seed",
    participantsCount: 41,
    rating: 4.2,
    createdAt: new Date(),
  },
  {
    title: "Zero single-use plastic week",
    shortDescription:
      "Avoid all single-use plastic — bags, bottles, cutlery — for seven days.",
    fullDescription:
      "Single-use plastic is a major waste and emissions contributor. For one week, avoid plastic bags, bottles, straws, and cutlery entirely, replacing them with reusable alternatives, and log your waste reduction daily.",
    category: "waste",
    difficulty: "hard",
    impactScore: 16,
    imageUrl: "https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800",
    createdBy: "seed",
    participantsCount: 23,
    rating: 4.6,
    createdAt: new Date(),
  },
];

async function seed() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  const existing = await db.collection("challenges").countDocuments();
  if (existing > 0) {
    console.log(`Skipping seed — ${existing} challenges already exist.`);
    await client.close();
    return;
  }

  await db.collection("challenges").insertMany(challenges);
  console.log(`Seeded ${challenges.length} challenges.`);
  await client.close();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
