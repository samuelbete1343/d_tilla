"""
courses/migrations/0001_initial.py
Generated from: python manage.py makemigrations courses
"""
import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Course",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=255)),
                ("slug", models.SlugField(blank=True, max_length=280, unique=True)),
                ("description", models.TextField()),
                ("category", models.CharField(max_length=100)),
                ("price", models.DecimalField(
                    blank=True,
                    decimal_places=2,
                    help_text="Display price only. Access is granted via CourseAccess, not price.",
                    max_digits=10,
                    null=True,
                )),
                ("image", models.URLField(blank=True, null=True)),
                # access_group is intentionally absent — removed in 0002_remove_access_group
                ("is_published", models.BooleanField(
                    default=False,
                    help_text="Only published courses are visible to students.",
                )),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.CreateModel(
            name="Lesson",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=255)),
                ("description", models.TextField(blank=True)),
                ("order_index", models.PositiveIntegerField(db_index=True, default=0)),
                ("is_free_preview", models.BooleanField(
                    default=False,
                    help_text="Free preview lessons are visible without a subscription.",
                )),
                ("duration_seconds", models.PositiveIntegerField(
                    default=0,
                    help_text="Video duration in seconds (fill manually for display).",
                )),
                ("youtube_url", models.URLField(
                    blank=True,
                    help_text="Paste the full YouTube URL here (e.g. https://youtu.be/abc123). The video ID is extracted automatically.",
                    max_length=500,
                )),
                ("youtube_video_id", models.CharField(blank=True, editable=False, max_length=50)),
                ("course", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="lessons",
                    to="courses.course",
                )),
            ],
            options={"ordering": ["order_index"]},
        ),
        migrations.CreateModel(
            name="Enrollment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("course", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="enrollments",
                    to="courses.course",
                )),
                ("user", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="enrollments",
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                "unique_together": {("user", "course")},
            },
        ),
        migrations.AddIndex(
            model_name="enrollment",
            index=models.Index(fields=["user", "is_active"], name="courses_enr_user_id_is_active_idx"),
        ),
        migrations.AddIndex(
            model_name="enrollment",
            index=models.Index(fields=["user", "course", "is_active"], name="courses_enr_user_course_idx"),
        ),
        migrations.CreateModel(
            name="Progress",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("is_completed", models.BooleanField(default=False)),
                ("last_watched_position", models.IntegerField(
                    default=0,
                    help_text="Seconds into the video.",
                )),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("course", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="progress_records",
                    to="courses.course",
                )),
                ("lesson", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="progress_records",
                    to="courses.lesson",
                )),
                ("user", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="progress_records",
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                "unique_together": {("user", "lesson")},
            },
        ),
        migrations.AddIndex(
            model_name="progress",
            index=models.Index(fields=["user", "course"], name="courses_pro_user_course_idx"),
        ),
        migrations.AddIndex(
            model_name="progress",
            index=models.Index(fields=["updated_at"], name="courses_pro_updated_idx"),
        ),
    ]
