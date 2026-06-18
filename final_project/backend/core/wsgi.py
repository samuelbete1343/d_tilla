import os
import csv
import io
import django
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from courses.models import Course

# --- ETHIOPIAN FRESHMAN COURSES CSV ---
CSV_DATA = """title,slug,price,is_published
Communicative English Language Skills I,flen-1011,200.00,True
General Physics,phys-1011,250.00,True
Mathematics for Natural Science,math-1011,250.00,True
General Chemistry,chem-1011,250.00,True
General Biology,biol-1011,250.00,True
Introduction to Computing,cosc-1011,300.00,True
Critical Thinking,phil-1011,180.00,True
Moral and Civic Education,mcie-1011,150.00,True
Geography of Ethiopia and the Horn,geog-1011,200.00,True
Social Anthropology,anth-1011,180.00,True
General Psychology,psyc-1011,180.00,True
Mathematics for Social Science,math-1012,200.00,True
Economics,econ-1011,220.00,True
Global Trends,irhs-1011,180.00,True
Inclusiveness,snie-1011,150.00,True
Physical Fitness,spsc-1011,100.00,True
"""

def import_ethiopian_courses():
    try:
        f = io.StringIO(CSV_DATA.strip())
        reader = csv.DictReader(f)
        for row in reader:
            # We use update_or_create so it doesn't create duplicates 
            # if you run this script multiple times.
            course, created = Course.objects.update_or_create(
                slug=row['slug'],
                defaults={
                    'title': row['title'],
                    'price': float(row['price']),
                    'is_published': row['is_published'] == 'True',
                }
            )
            if created:
                print(f"ADDED: {course.title} ({course.slug})")
            else:
                print(f"UPDATED: {course.title}")
    except Exception as e:
        print(f"IMPORT ERROR: {e}")

# Run the import
print("Starting Ethiopian Course Import...")
import_ethiopian_courses()

application = get_wsgi_application()
