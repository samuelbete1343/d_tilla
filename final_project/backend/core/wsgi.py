import os
import json
import django
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from courses.models import Course, Lesson

def smart_import():
    fixture_path = 'courses/fixtures/ethiopian_freshman_courses_fixture.json'
    if not os.path.exists(fixture_path):
        print("No fixture found.")
        return

    with open(fixture_path, 'r') as f:
        data = json.load(f)
        
    print("🚀 Running Smart Import (Bug 1 Fix)...")
    
    # 1. Import Courses First
    courses_map = {} # Maps fixture PK to real DB object
    for entry in data:
        if entry['model'] == 'courses.course':
            f = entry['fields']
            course, _ = Course.objects.update_or_create(
                catalogue_code=f['catalogue_code'],
                defaults={
                    'title': f['title'],
                    'slug': f['slug'],
                    'description': f['description'],
                    'category': f['category'],
                    'price': f['price'],
                    'is_published': f['is_published']
                }
            )
            courses_map[entry['pk']] = course
            print(f"  Synced Course: {f['catalogue_code']}")

    # 2. Import Lessons and link them correctly
    for entry in data:
        if entry['model'] == 'courses.lesson':
            f = entry['fields']
            parent_course = courses_map.get(f['course'])
            if parent_course:
                Lesson.objects.update_or_create(
                    course=parent_course,
                    title=f['title'],
                    order_index=f['order_index'],
                    defaults={
                        'description': f['description'],
                        'youtube_url': f['youtube_url'],
                        'is_free_preview': f['is_free_preview'],
                        'duration_seconds': f['duration_seconds']
                    }
                )
    print("✅ Smart Import Complete. No PK conflicts.")

# Run it once
smart_import()

application = get_wsgi_application()
