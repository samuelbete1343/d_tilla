import os
import django
from django.core.wsgi import get_wsgi_application

# FIX: Added the 'S' to SETTINGS
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# Initialize Django before running any commands
django.setup()

from django.core.management import call_command

# Emergency migration trigger
try:
    print("Checking for database migrations...")
    call_command('migrate', interactive=False)
    print("Migrations completed successfully!")
except Exception as e:
    print(f"Migration failed or skipped: {e}")

application = get_wsgi_application()
