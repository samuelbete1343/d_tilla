"""
quizzes/migrations/0001_initial.py
Generated from: python manage.py makemigrations quizzes
"""
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("courses", "0002_remove_access_group"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Quiz",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=255)),
                ("description", models.TextField(blank=True)),
                ("passing_score", models.IntegerField(default=70)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("lesson", models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="quiz",
                    to="courses.lesson",
                )),
            ],
        ),
        migrations.CreateModel(
            name="Question",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("text", models.TextField()),
                ("order_index", models.PositiveIntegerField(default=0)),
                ("quiz", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="questions",
                    to="quizzes.quiz",
                )),
            ],
            options={"ordering": ["order_index"]},
        ),
        migrations.CreateModel(
            name="Choice",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("text", models.CharField(max_length=255)),
                ("is_correct", models.BooleanField(default=False)),
                ("question", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="choices",
                    to="quizzes.question",
                )),
            ],
        ),
        migrations.CreateModel(
            name="QuizAttempt",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("score_percentage", models.FloatField(default=0.0)),
                ("passed", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("quiz", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="attempts",
                    to="quizzes.quiz",
                )),
                ("user", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="quiz_attempts",
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
        ),
        migrations.CreateModel(
            name="UserAnswer",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("attempt", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="answers",
                    to="quizzes.quizattempt",
                )),
                ("question", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    to="quizzes.question",
                )),
                ("selected_choice", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    to="quizzes.choice",
                )),
            ],
        ),
    ]
