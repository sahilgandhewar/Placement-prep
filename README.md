# 🚀 PlacePrep AI — Setup Guide

## ✅ Prerequisites
Install these before starting:
1. **Node.js 18+** → https://nodejs.org
2. **MongoDB** (one of):
   - MongoDB Atlas (free cloud): https://www.mongodb.com/atlas
   - MongoDB local: https://www.mongodb.com/try/download/community
3. **VS Code** (already have)
4. **Git** (optional)

---

## 📦 Step 1 — Install Dependencies

Open VS Code terminal (`Ctrl + ~`) and run:

```bash
npm install
```

Wait for all packages to install (~2 mins first time).

---

## 🔑 Step 2 — Configure Environment

Edit the `.env.local` file in the root folder:

```env
# Option A: MongoDB Atlas (recommended for beginners)
MONGODB_URI=mongodb+srv://youruser:yourpass@cluster.mongodb.net/placement-prep

# Option B: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/placement-prep

# Generate a random secret (any long string)
JWT_SECRET=my-super-secret-placement-prep-key-2024

# NextAuth (required)
NEXTAUTH_SECRET=my-nextauth-secret-2024
NEXTAUTH_URL=http://localhost:3000

# OpenAI API key (get from platform.openai.com)
# Leave as-is if you don't have one — app works in demo mode without it
OPENAI_API_KEY=sk-your-key-here
```

### 🆓 Free MongoDB Atlas Setup:
1. Go to https://www.mongodb.com/atlas
2. Create free account → Create free cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string and replace in `.env.local`

---

## 🚀 Step 3 — Start the App

```bash
npm run dev
```

Open browser: **http://localhost:3000**

---

## 🎮 Step 4 — Use the App

### Demo Mode (No MongoDB needed):
Just enter **any email + any password** on the login screen → it will log you in with a demo account!

### With MongoDB:
1. Click "Create one free" on login page
2. Fill in signup form
3. Login with your credentials

---

## 📁 Project Structure

```
placement-prep/
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── login/          ← Login page
│   │   │   └── signup/         ← Signup page
│   │   ├── dashboard/          ← Main dashboard
│   │   ├── aptitude/           ← Aptitude tests
│   │   ├── coding/             ← Code editor (Monaco)
│   │   ├── resume/             ← AI Resume analyzer
│   │   ├── interview/          ← Mock interview
│   │   ├── recommend/          ← AI recommendations
│   │   ├── analytics/          ← Performance charts
│   │   ├── admin/              ← Admin panel
│   │   └── api/                ← Backend API routes
│   ├── components/             ← Reusable components
│   ├── lib/                    ← DB connection, models
│   └── styles/                 ← Global CSS
├── .env.local                  ← Your config (edit this!)
├── package.json
└── README.md
```

---

## 🧩 Modules Available

| Module | Route | Description |
|--------|-------|-------------|
| Login | `/auth/login` | JWT authentication |
| Signup | `/auth/signup` | User registration |
| Dashboard | `/dashboard` | Overview, stats, charts |
| Aptitude | `/aptitude` | Timed MCQ tests |
| Coding | `/coding` | Monaco code editor |
| Resume | `/resume` | AI PDF analyzer |
| Interview | `/interview` | AI mock interview chat |
| Recommendations | `/recommend` | AI study planner |
| Analytics | `/analytics` | Performance charts |
| Admin | `/admin` | User & question management |

---

## 🤖 OpenAI Integration

To enable real AI features (resume analysis, interview feedback):

1. Get API key from https://platform.openai.com
2. Add to `.env.local`:
   ```
   OPENAI_API_KEY=sk-your-actual-key
   ```
3. Restart dev server

Without the key, the app uses mock data — perfect for demo/viva!

---

## 🐛 Troubleshooting

### "Module not found" error:
```bash
rm -rf node_modules
npm install
```

### MongoDB connection error:
- Check your `MONGODB_URI` in `.env.local`
- Make sure MongoDB Atlas IP is whitelisted (use 0.0.0.0/0 for dev)
- Or use demo mode (login with any credentials)

### Port already in use:
```bash
npm run dev -- -p 3001
```
Then open http://localhost:3001

### TypeScript errors:
```bash
npm run build
```
Check the error message — usually a missing import.

---

## 🏗️ Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **UI**: Recharts, Monaco Editor, Framer Motion
- **Backend**: Next.js API Routes (REST)
- **Database**: MongoDB + Mongoose
- **Auth**: JWT + bcryptjs
- **AI**: OpenAI GPT-4 API
- **Fonts**: Plus Jakarta Sans, Sora, JetBrains Mono

---

## 📊 For Viva / Presentation

Key talking points:
1. **Architecture**: Monolithic Next.js with API routes + MongoDB
2. **Auth**: JWT stored in localStorage, bcrypt password hashing
3. **AI Layer**: OpenAI API for resume analysis and interview feedback
4. **Real-time**: Timer in aptitude tests, live chat in interviews
5. **Analytics**: Recharts for data visualization
6. **Code Editor**: Monaco Editor (VS Code in browser)
7. **Design**: Dark theme, glassmorphism, Tailwind CSS

---

Built with ❤️ for placement preparation
