# 🌿 EcoTrack — Backend

![EcoTrack banner](./public/banner.svg)

Express + TypeScript + MongoDB API powering [EcoTrack](https://ecotrack-client.vercel.app) — carbon footprint tracking with AI-powered analysis and recommendations.

## 🔗 Links

| | |
|---|---|
| 🌍 Live App | [ecotrack-client.vercel.app](https://ecotrack-client.vercel.app) |
| ⚙️ API | [ecotrack-server-shbb.onrender.com](https://ecotrack-server-shbb.onrender.com/api/health) |
| 💻 Frontend Repo | [github.com/tanzid-48/ecotrack-client](https://github.com/tanzid-48/ecotrack-client) |

## 🛠️ Tech Stack
Express · TypeScript · MongoDB (native driver) · BetterAuth (email/password + Google OAuth, bearer tokens) · Groq AI (llama-3.3-70b-versatile)

## 📡 API Routes

```
/api/auth/*                     BetterAuth (login, register, session, Google OAuth)
/api/activities                 GET, POST  — log & fetch daily activity
/api/activities/:id             DELETE
/api/challenges                 GET, POST  — search, filter, sort, paginate
/api/challenges/:id             GET, DELETE
/api/challenges/:id/join        POST
/api/challenges/mine/list       GET
/api/reviews                    POST
/api/ai/analyze-footprint       POST — AI Data Analyzer
/api/ai/recommend               POST — AI Recommendation Engine
/api/ai/generate-challenge-description   POST — AI Content Generator
```

## 🚀 Running Locally

```bash
npm install
npm run seed   # populates sample challenges
npm run dev
```

Create `.env`:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
DB_NAME=ecotrack
BETTER_AUTH_SECRET=any_random_string
BETTER_AUTH_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GROQ_API_KEY=your_groq_api_key
```

## 👤 Author
**Tanzid** — [GitHub](https://github.com/tanzid-48) · [LinkedIn](https://linkedin.com/in/tanzidmondol)
