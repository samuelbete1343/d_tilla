"""
courses/migrations/0003_remove_enrollment.py

Drops the Enrollment table.

Enrollment was the old access gate, now fully replaced by
payments.CourseAccess. All access checks use has_course_access()
from payments.access — no Enrollment rows are read anywhere.

Run BEFORE deploying the new code:
    python manage.py migrate courses

Data impact:
    - The courses_enrollment table is dropped.
    - No other table has a FK pointing to it (confirmed: Enrollment had
      FKs TO User and Course, not FROM other tables).
    - Progress records are kept — they are keyed to (user, lesson),
      not to Enrollment.
"""
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0002_remove_access_group'),
    ]

    operations = [
        migrations.DeleteModel(
            name='Enrollment',
        ),
    ]
