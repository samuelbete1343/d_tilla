# Tilla — Deployment Guide

## Stack
- **Frontend:** React + Vite → deploy to **Vercel**
- **Backend:** Django + DRF → deploy to **Railway**
- **Database:** PostgreSQL → provided by Railway's Postgres plugin

---

## Step 1 — Generate a SECRET_KEY

Run this once locally and save the output:

```bash
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

---

## Step 2 — Deploy the Backend to Railway

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
2. Select your repo, set the root directory to `backend/`
3. Railway auto-detects Python and uses your `Dockerfile`
4. Add a **PostgreSQL** plugin from the Railway dashboard — it auto-sets `DATABASE_URL`
5. Add these environment variables in Railway's dashboard:

| Variable | Value |
|---|---|
| `DJANGO_SECRET_KEY` | Your 50-char random key from Step 1 |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | `your-app.up.railway.app` (Railway gives you this URL) |
| `CORS_ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` (set after Step 3) |
| `DATABASE_URL` | Auto-set by Railway's Postgres plugin |

6. Railway runs your Dockerfile automatically → gunicorn starts

**First deploy only** — run migrations via Railway's shell:
```bash
python manage.py migrate
python manage.py createsuperuser
```

---

## Step 3 — Deploy the Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Set root directory to `frontend/`
3. Vercel auto-detects Vite
4. Add this environment variable in Vercel's dashboard:

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://your-app.up.railway.app/api` |

5. Deploy

---

## Step 4 — Update CORS on the Backend

Once Vercel gives you your frontend URL (e.g. `https://tilla.vercel.app`):

1. Go back to Railway dashboard
2. Update `CORS_ALLOWED_ORIGINS` to `https://tilla.vercel.app`
3. Redeploy backend (or Railway auto-redeploys on env var change)

---

## Step 5 — Add Course Data via Django Admin

1. Go to `https://your-app.up.railway.app/admin`
2. Log in with the superuser you created
3. Add courses under **Courses → Courses**
4. Make sure course `slug` values match the frontend IDs in `Courses.tsx`
   (e.g. course named "General Physics" should have slug `general-physics`)

---

## Step 6 — Verify the Payment Flow End-to-End

1. Register a student account
2. Select 7 courses → Checkout → Submit Payment Request
3. Student sends receipt to Telegram (@Tilla_Register)
4. Admin logs into `/admin` → Payments → Payment Requests
5. Select the request → Action: **✅ Approve** → CourseAccess rows are created
6. Student refreshes dashboard → courses appear as unlocked

---

## Local Development (without Docker)

**Backend:**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # edit .env with your values
export $(cat .env | xargs)    # load env vars
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
cp .env.example .env          # edit VITE_API_URL if needed
npm install
npm run dev
```

**Or with Docker (includes Postgres automatically):**
```bash
docker-compose up --build
# Backend: http://localhost:8000
# Frontend: http://localhost:5173
# Admin: http://localhost:8000/admin
```

---

## Course ID Mapping (Important)

The frontend `Courses.tsx` uses string IDs like `'FLEn-1011'` to identify courses.
The backend uses integer PKs. The `Checkout.tsx` resolves IDs by matching slugs.

**Before going live, make sure every course in Django Admin has a slug that matches
the frontend course catalogue.** The safest approach is to create courses in order
and verify the slug auto-generation matches.

Example:
- Frontend ID: `'Phys-1011'`
- Backend course title: `'General Physics'`
- Backend slug: `'general-physics'`  ← these need to match what Checkout.tsx resolves

The matching logic in `Checkout.tsx` uses substring matching as a fallback,
but exact slug matches are more reliable.

---

## Environment Variable Summary

### Backend (Railway)
```
DJANGO_SECRET_KEY=<50-char random string>
DEBUG=False
ALLOWED_HOSTS=your-app.up.railway.app
DATABASE_URL=<auto-set by Railway Postgres plugin>
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

### Frontend (Vercel)
```
VITE_API_URL=https://your-app.up.railway.app/api
```
