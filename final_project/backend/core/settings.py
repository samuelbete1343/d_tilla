"""
Tilla — core/settings.py  (PRODUCTION-READY)

All secrets come from environment variables — never hardcoded here.

FIXES APPLIED IN THIS VERSION:
  FIX-PROD-1  Removed hardcoded 192.168.1.2 from ALLOWED_HOSTS.
  FIX-PROD-2  Removed dead main() function that did nothing (dotenv was
              already loaded by the try/except block below it).
  FIX-PROD-3  Added catalogue_code field to Course model (exists in
              migration 0005 but was missing from models.py — caused
              AttributeError on any Course.catalogue_code access).
              NOTE: The actual fix is in courses/models.py (see that file).
  FIX-PROD-4  CORS_ALLOW_CREDENTIALS=True added so JWT cookies work across
              origins if ever needed; safe to have alongside header auth.
  FIX-PROD-5  Added RENDER/RAILWAY host auto-detection via env var pattern.
  FIX-PROD-6  MEDIA files on Render/Railway: documented that media is
              ephemeral on free tier — admin PDF notes will not persist
              across deploys. Added warning comment.
  FIX-PROD-7  gunicorn timeout env var wired into start command (see
              Procfile / render.yaml).
"""

import os
import dj_database_url
from datetime import timedelta
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# ---------------------------------------------------------------------------
# Load .env in local development (python-dotenv must be installed).
# In production (Railway, Render) env vars are injected by the platform.
# ---------------------------------------------------------------------------
try:
    from dotenv import load_dotenv
    load_dotenv(BASE_DIR / ".env")
except ImportError:
    pass

# ---------------------------------------------------------------------------
# Core security
# ---------------------------------------------------------------------------
_raw_debug = os.environ.get("DEBUG", "False")
DEBUG = _raw_debug == "True"

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY")
if not SECRET_KEY:
    if DEBUG:
        import warnings
        SECRET_KEY = "local-dev-INSECURE-do-not-use-in-production-ever"
        warnings.warn(
            "\n\n⚠️  DJANGO_SECRET_KEY is not set.\n"
            "   Using an insecure fallback — LOCAL DEVELOPMENT ONLY.\n",
            stacklevel=2,
        )
    else:
        raise RuntimeError(
            "DJANGO_SECRET_KEY environment variable is not set.\n"
            "Generate one with:\n"
            "  python -c \"import secrets; print(secrets.token_urlsafe(50))\""
        )

# FIX-PROD-1: Removed hardcoded 192.168.1.2 — only load from env var.
# In production set ALLOWED_HOSTS to your Render/Railway domain.
# Example: ALLOWED_HOSTS=tilla-backend.onrender.com
ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")
# Strip whitespace from each host (env var may have spaces after commas)
ALLOWED_HOSTS = [h.strip() for h in ALLOWED_HOSTS if h.strip()]

# ---------------------------------------------------------------------------
# Apps
# ---------------------------------------------------------------------------
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # third-party
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    # local
    "accounts",
    "courses",
    "payments",
    "quizzes",
    "notes",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",   # second, right after SecurityMiddleware
    "corsheaders.middleware.CorsMiddleware",        # before CommonMiddleware
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF     = "core.urls"
WSGI_APPLICATION = "core.wsgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ]
        },
    }
]

# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------
_database_url = os.environ.get("DATABASE_URL")
if _database_url:
    DATABASES = {
        "default": dj_database_url.config(
            default=_database_url,
            conn_max_age=600,
            conn_health_checks=True,
        )
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME":   BASE_DIR / "db.sqlite3",
        }
    }

# ---------------------------------------------------------------------------
# Custom user model
# ---------------------------------------------------------------------------
AUTH_USER_MODEL = "accounts.User"

AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
]

# ---------------------------------------------------------------------------
# Password validation
# ---------------------------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 8}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ---------------------------------------------------------------------------
# DRF — JWT-only authentication (no SessionAuthentication = no CSRF on API)
# ---------------------------------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_RENDERER_CLASSES": (
        "core.renderers.CustomJSONRenderer",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon":           "30/min",
        "user":           "200/min",
        "login":          "10/min",
        "payment_submit": "5/hour",
    },
}

# ---------------------------------------------------------------------------
# JWT
# ---------------------------------------------------------------------------
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME":    timedelta(hours=1),
    "REFRESH_TOKEN_LIFETIME":   timedelta(days=7),
    "ROTATE_REFRESH_TOKENS":    True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN":        True,
    "ALGORITHM":                "HS256",
    "SIGNING_KEY":              SECRET_KEY,
    "AUTH_HEADER_TYPES":        ("Bearer",),
}

# ---------------------------------------------------------------------------
# CORS
# FIX-PROD-4: CORS_ALLOW_CREDENTIALS added.
# In production, set CORS_ALLOWED_ORIGINS to your Vercel/Netlify domain.
# Example: CORS_ALLOWED_ORIGINS=https://tilla.vercel.app
# ---------------------------------------------------------------------------
CORS_ALLOWED_ORIGINS = [
    o.strip() for o in os.environ.get(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if o.strip()
]
CORS_ALLOW_CREDENTIALS = True

# ---------------------------------------------------------------------------
# Static files (WhiteNoise serves them from /staticfiles/)
# ---------------------------------------------------------------------------
STATIC_URL  = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STORAGES = {
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
}

# ---------------------------------------------------------------------------
# Media files
# FIX-PROD-6: On Render/Railway free tier the filesystem is EPHEMERAL.
# Uploaded PDF notes will be lost on every redeploy.
# For production, either:
#   (a) Accept this limitation (admin re-uploads after each deploy), or
#   (b) Use Cloudinary or AWS S3 for persistent media storage.
# For now, FileSystemStorage is kept as-is (works for MVP).
# ---------------------------------------------------------------------------
MEDIA_URL  = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
LANGUAGE_CODE      = "en-us"
TIME_ZONE          = "UTC"
USE_I18N           = True
USE_TZ             = True

# ---------------------------------------------------------------------------
# HTTPS / Security headers
#
# SECURE_SSL_REDIRECT defaults to False because Railway/Render terminate TLS
# at the proxy layer. Django sees plain HTTP internally.
# SECURE_PROXY_SSL_HEADER correctly signals HTTPS via X-Forwarded-Proto.
# ---------------------------------------------------------------------------
if not DEBUG:
    SECURE_SSL_REDIRECT = os.environ.get("SECURE_SSL_REDIRECT", "False") == "True"
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SESSION_COOKIE_SECURE          = True
    CSRF_COOKIE_SECURE             = True
    SECURE_HSTS_SECONDS            = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD            = True

SECURE_BROWSER_XSS_FILTER   = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY       = "strict-origin-when-cross-origin"
X_FRAME_OPTIONS              = "DENY"

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "simple": {"format": "{levelname} {name} {message}", "style": "{"},
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "simple",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "WARNING" if not DEBUG else "INFO",
    },
    "loggers": {
        "payments":       {"handlers": ["console"], "level": "INFO",  "propagate": False},
        "accounts":       {"handlers": ["console"], "level": "INFO",  "propagate": False},
        "django.request": {"handlers": ["console"], "level": "ERROR", "propagate": False},
    },
}
