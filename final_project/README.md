# Tilla — Full-Stack Web Application

A modern educational platform (Ethiopian university courses) built with:
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Django 4.2 + Django REST Framework + JWT Auth

---

## Project Structure

```
tilla_fullstack/
├── backend/                  # Django REST API
│   ├── accounts/             # User registration, login, profile
│   ├── courses/              # Courses, lessons, enrollment, progress
│   ├── quizzes/              # Quizzes, questions, submissions
│   ├── notes/                # Lesson notes (text + PDF)  ← new
│   ├── subscriptions/        # Plans, payment requests, access control
│   ├── core/                 # Django settings, root URLs
│   ├── manage.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── components/       # Shared UI (Header, Footer, Modals…)
│   │   ├── context/          # React contexts (Auth, Cart, Theme, Language)
│   │   ├── lib/api.ts        # Thin fetch wrapper with JWT injection
│   │   └── pages/
│   │       ├── QuizPage.tsx  # ← from tilla_quiz_notes_pages
│   │       ├── NotesPage.tsx # ← from tilla_quiz_notes_pages
│   │       └── …all other pages
│   ├── Dockerfile
│   └── .env.example
│
├── docker-compose.yml        # One-command dev startup
└── README.md
```

---

## Quick Start (Local Development)

### Option A — Docker (recommended)

```bash
docker-compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api
- Django Admin: http://localhost:8000/admin

Create a superuser for admin access:
```bash
docker-compose exec backend python manage.py createsuperuser
```

---

### Option B — Manual

**Backend**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env          # edit DJANGO_SECRET_KEY
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

**Frontend**
```bash
cd frontend
cp .env.example .env          # VITE_API_URL=http://localhost:8000/api
npm install
npm run dev
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/auth/login/` | Login → JWT tokens |
| POST | `/api/auth/logout/` | Blacklist refresh token |
| GET/PATCH | `/api/auth/profile/` | View / update profile |
| GET | `/api/courses/` | List published courses |
| GET | `/api/courses/<id>/` | Course detail with lessons |
| POST | `/api/courses/<id>/enroll/` | Enroll in course |
| GET | `/api/courses/<id>/lessons/` | Lessons (with access gating) |
| GET | `/api/courses/<id>/progress/` | Completion progress |
| GET | `/api/courses/<id>/resume/` | Next lesson to watch |
| POST | `/api/courses/lesson/<id>/complete/` | Mark lesson done |
| POST | `/api/courses/lesson/<id>/progress/` | Save watch position |
| GET | `/api/quizzes/<lesson_id>/` | Get quiz for lesson |
| POST | `/api/quizzes/<quiz_id>/submit/` | Submit quiz answers |
| GET | `/api/quizzes/my-attempts/` | Quiz history |
| GET | `/api/notes/course/<course_id>/` | All notes for a course |
| GET | `/api/notes/lesson/<lesson_id>/` | Notes for one lesson |
| GET | `/api/subscriptions/plans/` | Available plans |
| GET | `/api/subscriptions/status/` | User's subscription status |
| POST | `/api/subscriptions/submit-payment/` | Submit payment request |

---

## Frontend Routes

| Path | Component | Notes |
|------|-----------|-------|
| `/` | Home | Landing page |
| `/login` | Login | |
| `/signup` | Signup | |
| `/dashboard` | Dashboard | Auth required |
| `/courses` | Courses | Freshman portal |
| `/entrance-courses` | EntranceCourses | Entrance prep |
| `/courses/:id` | CourseDetail | |
| `/learn/:courseId` | CourseLearning | Auth + enroll required |
| `/quiz/:lessonId` | **QuizPage** | ← new |
| `/notes/:courseId` | **NotesPage** | ← new |
| `/exam/:type/:courseId` | ExamSession | |
| `/flagged` | FlaggedQuestions | |
| `/pricing` | PricingPage | |
| `/checkout` | Checkout | |

---

## Access Control (Subscription Tiers)

| Plan Price | Access |
|------------|--------|
| Free (0 ETB) | Free-preview lessons in free_group courses only |
| Essential (~100 ETB) | All lessons in free_group + essential_group |
| Premium (~180 ETB) | All 15 courses, quizzes, and notes |

---

## What Was Combined

1. **tilla_backend_final** — Django REST API (accounts, courses, quizzes, subscriptions)
2. **tilla_frontend_final** — React SPA (all pages, components, contexts)
3. **tilla_quiz_notes_pages** — `QuizPage.tsx` + `NotesPage.tsx` added as new routes

**Integration changes made:**
- `frontend/src/App.tsx` — added `/quiz/:lessonId` and `/notes/:courseId` routes
- `backend/notes/` — new Django app created to back `NotesPage` (the API it expects)
- `NotesPage.tsx` — API call updated from `/courses/<id>/notes/` → `/notes/course/<id>/`
- `backend/core/settings.py` — `notes` app registered
- `backend/core/urls.py` — `/api/notes/` URL included
- Docker + env files added for one-command startup
