import os
import django
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model

# Force Admin Update Logic for Email-based Login
try:
    User = get_user_model()
    # Your model uses email as the unique field
    email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@example.com')
    password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'TillaAdmin123!')
    full_name = os.environ.get('DJANGO_SUPERUSER_FULL_NAME', 'Admin User')

    # Find the user by email
    user, created = User.objects.get_or_create(email=email)
    user.set_password(password)
    user.full_name = full_name
    user.is_staff = True
    user.is_superuser = True
    user.is_active = True
    user.save()
    
    if created:
        print(f"ADMIN FIXER: Created new superuser with email: {email}")
    else:
        print(f"ADMIN FIXER: Updated existing user {email} and forced password/staff status")

except Exception as e:
    print(f"ADMIN FIXER ERROR: {e}")

application = get_wsgi_application()
