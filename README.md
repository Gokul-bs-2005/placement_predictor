VERCEL LInk
<a href="https://placement-predictor-mgur.vercel.app/">Placement Predictor</a>


<<<<<<< HEAD
# Placement Predictor AI — Fixed & Vercel-Ready

## Project Structure

```
placement_predictor_project/
├── frontend/          ← React + Vite + Tailwind (deploy to Vercel)
├── backend/           ← Flask + SQLite + ML Model (deploy to Render/Railway)
└── ml-model/          ← Trained models + dataset
```

---

## 🐛 Bugs Fixed

| # | File | Bug | Fix |
|---|------|-----|-----|
| 1 | `frontend/src/services/api/client.js` | Hardcoded `http://127.0.0.1:5000` — breaks in production | Uses `VITE_API_URL` env var |
| 2 | `frontend/src/components/Chatbot.jsx` | Same hardcoded URL | Uses `VITE_API_URL` env var |
| 3 | `backend/app.py` | `import requests` but `requests` not in `requirements.txt` | Replaced with `urllib.request` (stdlib) |
| 4 | `backend/app.py` | GROQ_API_KEY hardcoded as string literal | Now reads from `os.environ.get("GROQ_API_KEY")` |
| 5 | `backend/app.py` | `/students` ignored `search` and `result` query params | Fixed SQLAlchemy `.ilike()` filter |
| 6 | `backend/app.py` | Missing HTTP status codes on error responses | Added proper 400/401/409/500 codes |
| 7 | `frontend/src/pages/Predict.jsx` | Number fields sent as strings → model rejected | `parseFloat()` on submit |
| 8 | `frontend/src/pages/History.jsx` | Accessed `item.cgpa` / `item.technical_skills` which backend didn't return | Backend now returns those fields; frontend updated |
| 9 | `frontend/package.json` | `"latest"` versions for all deps → unpredictable builds | Pinned to stable exact versions |
| 10 | `frontend/` | No `vite.config.js` file | Added `vite.config.js` |
| 11 | `frontend/` | No `vercel.json` → SPA routing breaks on refresh | Added `vercel.json` with rewrite rules |
| 12 | `backend/requirements.txt` | Missing `gunicorn` for production server | Added `gunicorn==22.0.0` |

---

## 🚀 Deploying Frontend to Vercel

### Step 1 — Push frontend to GitHub
```bash
cd frontend
git init
git add .
git commit -m "Initial commit"
gh repo create placement-predictor-frontend --public --push
```

### Step 2 — Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your `placement-predictor-frontend` repo
3. Set **Framework Preset** to `Vite`
4. Set **Root Directory** to `frontend`
5. Add **Environment Variable**:
   - `VITE_API_URL` = your deployed backend URL (e.g. `https://your-app.onrender.com`)
6. Click **Deploy**

> The `vercel.json` inside `frontend/` handles SPA routing (no 404 on refresh).

---

## 🚀 Deploying Backend to Render (Free)

> Vercel does NOT support long-running Python Flask apps. Use Render or Railway for the backend.

### Step 1 — Push backend to GitHub
```bash
# From project root
git init
git add backend/ ml-model/
git commit -m "Backend"
gh repo create placement-predictor-backend --public --push
```

### Step 2 — Deploy on Render
1. Go to [render.com](https://render.com) → **New Web Service**
2. Connect your backend repo
3. Settings:
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && gunicorn app:app`
4. Add **Environment Variables**:
   - `SECRET_KEY` = any random string
   - `JWT_SECRET_KEY` = any random string
   - `GROQ_API_KEY` = your key from [console.groq.com](https://console.groq.com)
5. **Deploy**

### Step 3 — Update Vercel frontend
- In Vercel project settings → Environment Variables
- Set `VITE_API_URL` = `https://your-render-backend-url.onrender.com`
- Redeploy frontend

---

## 🖥️ Running Locally

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
python app.py
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
# .env already has VITE_API_URL=http://127.0.0.1:5000
npm run dev
```

Open: http://localhost:3000

---

## 🔑 Getting a Groq API Key (Free)
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up → API Keys → Create new key
3. Add it as `GROQ_API_KEY` env variable in both local `.env` and Render

---

## Features
- JWT Authentication (Login / Signup)
- ML Placement Prediction (Logistic Regression + Random Forest)
- Student analytics with search & filter
- Prediction history per user
- PDF report download
- AI Chatbot (Groq LLaMA3)
- Dark mode toggle
- CSV export
=======
# placement_predictor
>>>>>>> c989c99e6c781429c295db200e526774182ec131
