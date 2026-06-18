import os
import django
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model

# Force Admin Update Logic
try:
    User = get_user_model()
    username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
    password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'TillaAdmin123!')
    email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@example.com')

    # If the user exists, update them. If not, create them.
    user, created = User.objects.get_or_create(username=username)
    user.set_password(password)
    user.email = email
    user.is_staff = True
    user.is_superuser = True
    user.save()
    
    if created:
        print(f"ADMIN FIXER: Created new superuser {username}")
    else:
        print(f"ADMIN FIXER: Updated existing user {username} and forced password")

except Exception as e:
    print(f"ADMIN FIXER ERROR: {e}")

application = get_wsgi_application()
