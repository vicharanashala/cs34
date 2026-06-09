# 🎓 Campus Doubt Hub

A community-driven Q&A platform where students ask questions, earn Skill Points (SP), receive badges, and admins moderate content.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Vite |
| Routing | React Router v6 |
| HTTP Client | Axios |
| State | Context API |
| Backend | Node.js + Express + TypeScript |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| Validation | Zod |
| UI | Vanilla CSS (dark theme) |

---

## Prerequisites

- Node.js 18+
- MongoDB running locally (or MongoDB Atlas URI)
- npm

---

## Project Structure

```
campus-doubt-hub/
├── client/          # React + Vite frontend
└── server/          # Express + TypeScript backend
```

---

## Quick Start

### 1. Clone the repository

```bash
git clone <repo-url>
cd campus-doubt-hub
```

### 2. Setup the Backend

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### 3. Seed the Admin User

```bash
npm run seed
```

This creates:
- **Email:** `admin@example.com`
- **Password:** `admin123`

### 4. Start the Backend

```bash
npm run dev
# Server runs on http://localhost:5000
```

### 5. Setup the Frontend

```bash
cd ../client
npm install
npm run dev
# App runs on http://localhost:5173
```

---

## Environment Variables (server/.env)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campus-doubt-hub
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

For **MongoDB Atlas**, replace `MONGODB_URI` with your Atlas connection string:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/campus-doubt-hub
```

---

## Features

### 👤 Users
- Register / Login with JWT
- Persistent login via localStorage
- Role-based access (USER / ADMIN)

### ❓ Questions
- Ask questions with tags
- Browse, search, filter by tag or answered status
- Paginated question feed
- View count tracking

### 💬 Answers
- Submit answers (pending admin approval)
- Edit / delete own pending answers
- Best answer highlighting (⭐)

### ⚡ SP Reward System
| Badge | Points |
|-------|--------|
| 🌱 Beginner | 0–50 SP |
| 💡 Helper | 51–200 SP |
| 🔥 Expert | 201–500 SP |
| ⭐ Mentor | 500+ SP |

- +10 SP awarded when answer is approved
- One-time reward per answer

### 🔔 Notifications
- Auto-generated on approve/reject/best-answer
- Unread badge on bell icon
- Mark read / mark all read

### 🔖 Bookmarks
- Save / remove questions

### 🏆 Leaderboard
- Ranked by SP points
- Gold/Silver/Bronze medals for top 3

### 🛡️ Admin Panel
- View all answers with filters (All / Pending / Approved / Rejected)
- Approve answers (+10 SP)
- Reject answers
- Mark best answer
- Analytics dashboard (user/question/answer counts)

---

## API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/questions          (search, tag, answered, page, limit)
GET    /api/questions/:id
POST   /api/questions
PUT    /api/questions/:id
DELETE /api/questions/:id

GET    /api/answers/question/:questionId
POST   /api/answers
PUT    /api/answers/:id
DELETE /api/answers/:id

GET    /api/bookmarks
POST   /api/bookmarks
DELETE /api/bookmarks/:id

GET    /api/notifications
PATCH  /api/notifications/:id/read
PATCH  /api/notifications/read-all

GET    /api/users/profile
GET    /api/users/leaderboard
GET    /api/users/activity

GET    /api/admin/answers
PATCH  /api/admin/answers/:id/approve
PATCH  /api/admin/answers/:id/reject
PATCH  /api/admin/answers/:id/best-answer
GET    /api/admin/analytics
```

---

## Build for Production

```bash
# Backend
cd server && npm run build
node dist/index.js

# Frontend
cd client && npm run build
# Serve dist/ with any static file server or Nginx
```

---

## Deployment Notes

- Set `NODE_ENV=production` in server `.env`
- Change `JWT_SECRET` to a strong random string
- Use MongoDB Atlas for hosted database
- Configure CORS origin in `server/src/app.ts` to match your frontend URL

---

## License

MIT
