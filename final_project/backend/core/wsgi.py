import os
from django.core.wsgi import get_wsgi_application
from django.core.management import call_command

os.environ.setdefault('DJANGO_SETTING_MODULE', 'core.settings')

application = get_wsgi_application()

# Emergency migration trigger
try:
    print("Running migrations...")
    call_command('migrate', interactive=False)
    print("Migrations completed successfully!")
except Exception as e:
    print(f"Migration failed: {e}")
