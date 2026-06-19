import os
import django
from django.core.wsgi import get_wsgi_application
from django.core.management import call_command

# Set settings and initialize Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

# --- FIXTURE LOADER ---
try:
    print("🚀 Attempting to load Ethiopian Freshman Fixtures...")
    # This looks for the file in backend/courses/fixtures/
    call_command('loaddata', 'ethiopian_freshman_courses_fixture.json')
    print("✅ Fixture loaded successfully!")
except Exception as e:
    print(f"❌ Error loading fixture: {e}")

# This must come AFTER the loaddata or Django might get confused
application = get_wsgi_application()
