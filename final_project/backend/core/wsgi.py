import os
from django.core.wsgi import get_wsgi_application
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
application = get_wsgi_application()
# ... (rest of the code)
try:
    call_command('loaddata', 'ethiopian_freshman_courses_fixture.json')
    print("✅ Fixture loaded successfully!")
# ...
