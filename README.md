# EcoTrack Server

## Setup
```bash
npm install
npm run dev
```

Server runs on http://localhost:5000

## Seed sample data (run once)
```bash
npm run seed
```
Populates 8 real sustainability challenges across all 5 categories so the Explore/Details pages have content immediately.

## AI Provider
This uses **Groq** (llama-3.3-70b-versatile) for both AI features. Get a free API key at https://console.groq.com/keys and set `GROQ_API_KEY` in `.env`.

## Test it's working
1. Visit http://localhost:5000/api/health — should show `{"status":"ok"}`
2. If MongoDB connects, you'll see `✅ Connected to MongoDB: ecotrack` in terminal
3. Register a user: POST http://localhost:5000/api/auth/sign-up/email
   Body: `{ "email": "test@test.com", "password": "test1234", "name": "Test" }`

## Routes
- `/api/auth/*` — BetterAuth (login/register/session)
- `/api/activities` — daily carbon activity logs
- `/api/challenges` — community sustainability challenges (CRUD + filter/sort/pagination)
- `/api/reviews` — challenge reviews
- `/api/ai/analyze-footprint` — AI Data Analyzer
- `/api/ai/recommend` — AI Recommendation Engine
- `/api/ai/generate-challenge-description` — AI Content Generator (for Add Challenge form)
