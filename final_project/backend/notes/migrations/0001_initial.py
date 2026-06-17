"""
notes/migrations/0001_initial.py
Generated from: python manage.py makemigrations notes
"""
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("courses", "0002_remove_access_group"),
    ]

    operations = [
        migrations.CreateModel(
            name="Note",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=255)),
                ("content", models.TextField(
                    blank=True,
                    help_text="Plain text or Markdown. Used when note_type='text'.",
                )),
                ("note_type", models.CharField(
                    choices=[("text", "Text / Markdown"), ("pdf", "PDF Download")],
                    default="text",
                    max_length=10,
                )),
                ("pdf_file", models.FileField(
                    blank=True,
                    help_text="Upload a PDF when note_type='pdf'.",
                    null=True,
                    upload_to="lesson_notes/%Y/%m/",
                )),
                ("order_index", models.PositiveIntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("lesson", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="notes",
                    to="courses.lesson",
                )),
            ],
            options={"ordering": ["order_index"]},
        ),
    ]
