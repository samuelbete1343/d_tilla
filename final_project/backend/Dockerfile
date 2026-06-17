FROM python:3.11-slim

WORKDIR /app

# System deps — only what's needed for psycopg2-binary
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Collect static files for WhiteNoise to serve.
# A dummy SECRET_KEY is required here because settings.py raises RuntimeError
# if the variable is missing. The real key is injected at container run time.
# This dummy value is NEVER used for signing tokens or sessions.
RUN DJANGO_SECRET_KEY=build-only-not-used-in-production \
    python manage.py collectstatic --noinput

EXPOSE 8000

# Use gunicorn in production — 3 workers is fine for ~2000 users
CMD ["gunicorn", "core.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "120"]
