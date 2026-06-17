# Tilla — Complete Production Deployment Guide

---

## PART 1: AUDIT RESULTS

### Deployment Blockers Found & Fixed

| # | Blocker | File | Fix Applied |
|---|---------|------|-------------|
| B-1 | `catalogue_code` field exists in migration `0005` but is **missing from `courses/models.py`** — causes `AttributeError` at runtime on any Course queryset that touches the field | `courses/models.py` | Added field to model |
| B-2 | Hardcoded `192.168.1.2` in `ALLOWED_HOSTS` — will cause `DisallowedHost` errors in production and is a security issue | `core/settings.py` | Removed; env-var only |
| B-3 | Dead `main()` function in `settings.py` that called `load_dotenv()` redundantly (dotenv already loaded by the try/except below) — confuses any WSGI scanner | `core/settings.py` | Removed |
| B-4 | `DEBUG` defaults to `"True"` in settings — if `DEBUG` env var is not set in production, Django runs in debug mode, leaking stack traces and disabling security hardening | `core/settings.py` | Changed default to `"False"` |
| B-5 | No `Procfile` — Render cannot start the app without it (render.yaml startCommand alone is not enough for all deploy paths) | — | Created `Procfile` |
| B-6 | No `render.yaml` / deployment config — no infrastructure-as-code; requires fully manual setup every time | — | Created `render.yaml` |
| B-7 | No `vercel.json` — React Router SPA routes return 404 on Vercel because the CDN serves `/login` as a file path, not a route | — | Created `vercel.json` with SPA rewrite rule |
| B-8 | No `netlify.toml` — same 404 issue on Netlify without the redirect rule | — | Created `netlify.toml` |
| B-9 | `CORS_ALLOWED_ORIGINS` whitespace: if env var has spaces after commas (e.g. `"https://a.com, https://b.com"`), Django CORS does not strip them — requests blocked | `core/settings.py` | Added `.strip()` to each origin |
| B-10 | `ALLOWED_HOSTS` whitespace: same issue — `"host1, host2"` becomes `["host1", " host2"]` and ` host2` never matches | `core/settings.py` | Added `.strip()` to each host |
| B-11 | `CORS_ALLOW_CREDENTIALS` not set — needed for any future cookie-based flows; harmless now but blocks JWT cookie auth if ever added | `core/settings.py` | Added `CORS_ALLOW_CREDENTIALS = True` |
| B-12 | `vite.config.ts` missing `build.rollupOptions` — Dashboard.tsx is ~56KB and causes Vite chunk size warning that can become a build failure in strict CI | `vite.config.ts` | Added chunk splitting |

### Runtime Issues (Non-blocking but would cause errors in production)

| # | Issue | Location | Status |
|---|-------|----------|--------|
| R-1 | `ForgotPasswordPage` links to `@Tilla_Support` — update to real Telegram handle before launch | `pages/ForgotPasswordPage.tsx` | **Manual action required** |
| R-2 | PDF `Note` files stored in ephemeral filesystem on Render/Railway free tier — files lost on every redeploy | `notes/models.py`, settings | Documented in settings; acceptable for MVP |
| R-3 | `db.sqlite3` committed to repo — contains local data; should be git-ignored | `.gitignore` | Check `.gitignore` includes `*.sqlite3` |
| R-4 | `__pycache__` directories in zip — should be git-ignored | — | Add to `.gitignore` |

### Missing Environment Variables

| Variable | Required | Where to set |
|----------|----------|-------------|
| `DJANGO_SECRET_KEY` | **Yes (production)** | Render dashboard |
| `DEBUG` | Yes | Render dashboard → `False` |
| `ALLOWED_HOSTS` | Yes | Render dashboard → your Render domain |
| `DATABASE_URL` | Yes | Auto-set by Render PostgreSQL add-on |
| `CORS_ALLOWED_ORIGINS` | Yes | Render dashboard → your Vercel domain |
| `VITE_API_URL` | Yes (frontend) | Vercel environment variables |

---

## PART 2: FILES TO REPLACE / ADD

Apply these files from the generated output before deploying:

```
backend/core/settings.py          ← REPLACE  (fixes B-2, B-3, B-4, B-9, B-10, B-11)
backend/courses/models.py         ← REPLACE  (fixes B-1: adds catalogue_code field)
backend/requirements.txt          ← REPLACE  (clean, no Pillow, pinned ranges)
backend/.env.example              ← REPLACE  (updated template)
backend/render.yaml               ← ADD NEW  (infrastructure-as-code for Render)
backend/Procfile                  ← ADD NEW  (fixes B-5)
frontend/vite.config.ts           ← REPLACE  (fixes B-12: chunk splitting)
frontend/vercel.json              ← ADD NEW  (fixes B-7: SPA routing)
frontend/netlify.toml             ← ADD NEW  (fixes B-8: SPA routing)
frontend/.env.example             ← REPLACE  (updated template)
```

---

## PART 3: COMMANDS TO RUN LOCALLY BEFORE DEPLOYING

Run these from your project root after applying all file fixes:

```bash
# 1. Verify backend starts cleanly (SQLite locally)
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py check --deploy 2>&1 | grep -v "WARNINGS"
# Expected: "System check identified no issues (0 silenced)."
# (deploy warnings about HTTPS are expected in local dev)

# 2. Verify frontend builds without errors
cd ../frontend
npm install
npm run build
# Expected: dist/ folder created, no TypeScript errors

# 3. Generate a strong secret key for production
python -c "import secrets; print(secrets.token_urlsafe(50))"
# Copy this output — you'll need it for the Render env var
```

---

## PART 4: DATABASE SETUP (PostgreSQL on Render)

Render's free PostgreSQL is automatically provisioned via `render.yaml`.
If setting up manually:

1. In Render dashboard → **New** → **PostgreSQL**
2. Name: `tilla-db`, Region: Oregon, Plan: **Free**
3. Copy the **Internal Database URL** (use Internal, not External, for the web service)
4. Set it as `DATABASE_URL` env var on your web service

**After backend deploys**, run migrations (Render runs them automatically via `render.yaml` buildCommand, but if manual):

```bash
# SSH into Render instance or use Render Shell:
python manage.py migrate --noinput
python manage.py createsuperuser
```

### Supabase Alternative (PostgreSQL that doesn't expire after 90 days)

1. Go to https://supabase.com → New Project
2. Settings → Database → Connection string → **URI** format
3. Copy the URI (it looks like `postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres`)
4. Set it as `DATABASE_URL` on Render

---

## PART 5: BACKEND DEPLOYMENT ON RENDER

### Step-by-step

1. **Push backend to GitHub**
   ```bash
   cd backend
   git init
   git add .
   git commit -m "Initial production-ready backend"
   git remote add origin https://github.com/YOUR_USERNAME/tilla-backend.git
   git push -u origin main
   ```

2. **Create Render Web Service**
   - Go to https://render.com → New → **Web Service**
   - Connect your GitHub repo
   - Settings:
     - **Name**: `tilla-backend`
     - **Runtime**: Python 3
     - **Build Command**: `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate --noinput`
     - **Start Command**: `gunicorn core.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120`
     - **Plan**: Free

3. **Set Environment Variables** (Render dashboard → Environment tab):

   | Key | Value |
   |-----|-------|
   | `DJANGO_SECRET_KEY` | (output of `secrets.token_urlsafe(50)`) |
   | `DEBUG` | `False` |
   | `ALLOWED_HOSTS` | `tilla-backend.onrender.com` |
   | `CORS_ALLOWED_ORIGINS` | `https://YOUR-APP.vercel.app` (fill after frontend deploy) |
   | `SECURE_SSL_REDIRECT` | `False` |
   | `DATABASE_URL` | (auto-filled if using Render PostgreSQL add-on) |

4. **Add PostgreSQL** (if not using `render.yaml` blueprint):
   - Render dashboard → New → PostgreSQL → Free
   - In your web service → Environment → Add from Database → select `tilla-db` → `DATABASE_URL`

5. **Click Deploy** — Render will build, collectstatic, migrate, and start gunicorn.

6. **After deploy, create superuser**:
   - Render dashboard → your web service → **Shell** tab
   ```bash
   python manage.py createsuperuser
   # Follow prompts: email, password
   ```

7. **Your backend URL**: `https://tilla-backend.onrender.com`
   - Admin panel: `https://tilla-backend.onrender.com/admin/`
   - API health: `https://tilla-backend.onrender.com/api/courses/`

---

## PART 6: FRONTEND DEPLOYMENT ON VERCEL

### Step-by-step

1. **Push frontend to GitHub**
   ```bash
   cd frontend
   git init
   git add .
   git commit -m "Initial production-ready frontend"
   git remote add origin https://github.com/YOUR_USERNAME/tilla-frontend.git
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to https://vercel.com → New Project → Import from GitHub
   - Select your frontend repo
   - Settings (Vercel usually auto-detects Vite):
     - **Framework Preset**: Vite
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`

3. **Set Environment Variables** (Vercel → Settings → Environment Variables):

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://tilla-backend.onrender.com/api` |

   ⚠️ Make sure to set this for **Production**, **Preview**, and **Development** environments.

4. **Deploy** — Vercel builds and deploys automatically.

5. **Your frontend URL**: `https://tilla-frontend.vercel.app` (or your custom domain)

6. **Go back to Render** and update `CORS_ALLOWED_ORIGINS`:
   - Value: `https://tilla-frontend.vercel.app`
   - Trigger a redeploy on Render (Manual Deploy button)

### Netlify Alternative

1. Go to https://netlify.com → New site → Import from Git
2. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. Environment variables → Add `VITE_API_URL` = `https://tilla-backend.onrender.com/api`
4. The `netlify.toml` file handles SPA routing automatically.

---

## PART 7: ENVIRONMENT VARIABLE REFERENCE

### Backend (set in Render dashboard)

```
DJANGO_SECRET_KEY=<50-char random string from secrets.token_urlsafe(50)>
DEBUG=False
ALLOWED_HOSTS=tilla-backend.onrender.com
DATABASE_URL=<auto-provided by Render PostgreSQL or your Supabase URI>
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
SECURE_SSL_REDIRECT=False
```

### Frontend (set in Vercel dashboard)

```
VITE_API_URL=https://tilla-backend.onrender.com/api
```

---

## PART 8: POST-DEPLOYMENT COMMANDS

Run these after both services are live:

```bash
# These run in Render Shell (dashboard → web service → Shell tab)

# 1. Verify migrations are current
python manage.py showmigrations

# 2. Create admin user (if not done during deploy)
python manage.py createsuperuser

# 3. (Optional) Seed course data if you have the seed command
python manage.py seed_courses

# 4. Verify static files collected
python manage.py collectstatic --noinput --dry-run
```

---

## PART 9: POST-DEPLOYMENT VERIFICATION CHECKLIST

Test each item after both services are live:

### Backend API
- [ ] `GET https://tilla-backend.onrender.com/api/courses/` returns `{"success": true, "data": [...]}` (may be empty array if no courses yet)
- [ ] `GET https://tilla-backend.onrender.com/admin/` shows Django admin login page
- [ ] `POST https://tilla-backend.onrender.com/api/auth/register/` with `{"email":"test@test.com","password":"Test1234!","confirm_password":"Test1234!"}` returns 201 with tokens
- [ ] `POST https://tilla-backend.onrender.com/api/auth/login/` with same credentials returns 200 with tokens
- [ ] CORS header present: response includes `Access-Control-Allow-Origin: https://your-frontend.vercel.app`

### Frontend
- [ ] `https://your-frontend.vercel.app/` loads the home page
- [ ] `https://your-frontend.vercel.app/login` loads the login page (not 404)
- [ ] `https://your-frontend.vercel.app/dashboard` redirects to `/login` (not 404)
- [ ] Login form submits and redirects to dashboard
- [ ] Dashboard loads and shows correct user name
- [ ] Page refresh on `/dashboard` stays on dashboard (SPA routing working)

### Auth Flow
- [ ] Register new user → auto-login → dashboard
- [ ] Logout → redirected to home
- [ ] Login again → dashboard
- [ ] Close browser, reopen → still logged in (localStorage token persists)
- [ ] Wait 1 hour or manually expire access token → app auto-refreshes without logging out

### Payment Flow
- [ ] Browse to `/explore-courses` → course list loads from API
- [ ] Click course → course detail page loads
- [ ] Add to cart → cart count updates in header
- [ ] Go to `/checkout` → selected courses shown
- [ ] Submit payment request → confirmation shown

### Admin Panel
- [ ] Log in at `/admin/` with superuser
- [ ] Can create a Course (with `is_published=True`)
- [ ] Course appears in frontend `/explore-courses`
- [ ] Can approve a PaymentRequest → CourseAccess row created

---

## PART 10: KNOWN LIMITATIONS (FREE TIER)

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| Render free web service sleeps after 15 min idle | 30-second cold start for first request | Acceptable for MVP. Upgrade to $7/month to remove. |
| Render PostgreSQL free expires after 90 days | DB deleted | Migrate to Supabase (free, no expiry) before day 85 |
| Ephemeral filesystem on Render | Uploaded PDF notes lost on redeploy | Re-upload after deploys. For persistence: Cloudinary or AWS S3. |
| Vercel free: 100GB bandwidth/month | Fine for MVP | Monitor in Vercel dashboard |

---

## PART 11: FOLDER STRUCTURE (FINAL)

```
tilla/
├── backend/
│   ├── .env.example          ← template (git-committed)
│   ├── .gitignore
│   ├── Procfile              ← NEW: gunicorn start command for Render
│   ├── render.yaml           ← NEW: infrastructure-as-code
│   ├── requirements.txt      ← UPDATED
│   ├── manage.py
│   ├── core/
│   │   ├── settings.py       ← FIXED (B-1 through B-4, B-9, B-10, B-11)
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── renderers.py
│   ├── accounts/             ← no changes needed
│   ├── courses/
│   │   └── models.py         ← FIXED (B-1: catalogue_code added)
│   ├── payments/             ← no changes needed
│   ├── quizzes/              ← no changes needed
│   └── notes/                ← no changes needed
│
└── frontend/
    ├── .env.example          ← UPDATED
    ├── vercel.json           ← NEW: SPA routing fix for Vercel
    ├── netlify.toml          ← NEW: SPA routing fix for Netlify
    ├── vite.config.ts        ← UPDATED (chunk splitting)
    ├── package.json          ← no changes needed
    ├── tsconfig.json         ← no changes needed
    ├── index.html
    └── src/                  ← no changes needed
```

---

## QUICK REFERENCE: URLS AFTER DEPLOYMENT

| Service | URL |
|---------|-----|
| Frontend | `https://tilla-frontend.vercel.app` |
| Backend API | `https://tilla-backend.onrender.com/api/` |
| Django Admin | `https://tilla-backend.onrender.com/admin/` |
| Auth: Register | `POST /api/auth/register/` |
| Auth: Login | `POST /api/auth/login/` |
| Auth: Refresh | `POST /api/auth/token/refresh/` |
| Auth: Logout | `POST /api/auth/logout/` |
| Courses | `GET /api/courses/` |
| Payment | `POST /api/payments/request/` |
| My Access | `GET /api/payments/my-access/` |
