"""
payments/migrations/0001_initial.py
Generated from: python manage.py makemigrations payments
"""
import django.db.models.deletion
import django.utils.timezone
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
            name="PaymentRequest",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("amount", models.DecimalField(
                    decimal_places=2,
                    default=100,
                    help_text="Fixed fee in ETB. Always 100 for V1.",
                    max_digits=8,
                )),
                ("status", models.CharField(
                    choices=[("pending", "Pending"), ("approved", "Approved"), ("rejected", "Rejected")],
                    db_index=True,
                    default="pending",
                    max_length=20,
                )),
                ("admin_note", models.TextField(
                    blank=True,
                    help_text="Reason for rejection or any admin note. Shown to the student.",
                )),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("reviewed_at", models.DateTimeField(blank=True, null=True)),
                ("user", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="payment_requests",
                    to=settings.AUTH_USER_MODEL,
                )),
                ("selected_courses", models.ManyToManyField(
                    related_name="payment_requests",
                    to="courses.course",
                )),
                ("reviewed_by", models.ForeignKey(
                    blank=True,
                    help_text="The admin user who approved or rejected this request.",
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name="reviewed_payment_requests",
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                "verbose_name": "Payment Request",
                "verbose_name_plural": "Payment Requests",
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="CourseAccess",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("approved_at", models.DateTimeField(default=django.utils.timezone.now)),
                ("course", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="course_accesses",
                    to="courses.course",
                )),
                ("payment_request", models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name="course_accesses",
                    to="payments.paymentrequest",
                )),
                ("user", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="course_accesses",
                    to=settings.AUTH_USER_MODEL,
                )),
                ("approved_by", models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name="granted_course_accesses",
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                "verbose_name": "Course Access",
                "verbose_name_plural": "Course Accesses",
                "unique_together": {("user", "course")},
            },
        ),
        migrations.AddIndex(
            model_name="courseaccess",
            index=models.Index(fields=["user", "course"], name="payments_ca_user_course_idx"),
        ),
        migrations.AddIndex(
            model_name="courseaccess",
            index=models.Index(fields=["user"], name="payments_ca_user_idx"),
        ),
    ]
