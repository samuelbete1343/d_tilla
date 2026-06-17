"""
payments/models.py

Two models replace the entire old subscriptions system:

  PaymentRequest  — student selects up to 7 courses and submits for review.
                    Admin verifies payment via Telegram, then approves or rejects.

  CourseAccess    — one row per (user, course) created automatically when admin
                    approves a PaymentRequest. This is the ONLY access gate.

Access check anywhere in the codebase:
    from payments.access import has_course_access
    has_course_access(user, course)  →  True / False
"""
from django.db import models, transaction
from django.conf import settings
from django.utils import timezone


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

MAX_COURSES_PER_REQUEST = 7
PAYMENT_AMOUNT_ETB = 100


# ---------------------------------------------------------------------------
# PaymentRequest
# ---------------------------------------------------------------------------

class PaymentRequest(models.Model):
    STATUS_PENDING  = "pending"
    STATUS_APPROVED = "approved"
    STATUS_REJECTED = "rejected"
    STATUS_CHOICES  = (
        (STATUS_PENDING,  "Pending"),
        (STATUS_APPROVED, "Approved"),
        (STATUS_REJECTED, "Rejected"),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="payment_requests",
    )
    # The courses the student chose to unlock (max 7, enforced in serializer)
    selected_courses = models.ManyToManyField(
        "courses.Course",
        related_name="payment_requests",
        blank=False,
    )
    # Fixed amount for audit trail — always 100 ETB for V1
    amount = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=PAYMENT_AMOUNT_ETB,
        help_text="Fixed fee in ETB. Always 100 for V1.",
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING,
        db_index=True,
    )
    # Admin fills this in when rejecting (shown to the student on dashboard)
    admin_note = models.TextField(
        blank=True,
        help_text="Reason for rejection or any admin note. Shown to the student.",
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_payment_requests",
        help_text="The admin user who approved or rejected this request.",
    )
    created_at  = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Payment Request"
        verbose_name_plural = "Payment Requests"

    def __str__(self):
        course_count = self.selected_courses.count() if self.pk else 0
        return f"{self.user.email} — {course_count} course(s) [{self.get_status_display()}]"

    # ------------------------------------------------------------------
    # Properties
    # ------------------------------------------------------------------

    @property
    def is_pending(self):
        return self.status == self.STATUS_PENDING

    @property
    def is_approved(self):
        return self.status == self.STATUS_APPROVED

    @property
    def is_rejected(self):
        return self.status == self.STATUS_REJECTED

    # ------------------------------------------------------------------
    # Business logic — called ONLY from admin actions, never from views
    # ------------------------------------------------------------------

    def approve(self, reviewed_by_user):
        """
        Approve this request:
          1. Create a CourseAccess row for every selected course.
          2. Mark this request as approved.

        Atomic + select_for_update: prevents double-approval race condition
        if two admin users or two browser tabs approve the same request
        simultaneously.
        """
        with transaction.atomic():
            # Re-fetch with a row-level lock so only one thread proceeds
            locked = (
                PaymentRequest.objects
                .select_for_update()
                .get(pk=self.pk)
            )
            if locked.status != self.STATUS_PENDING:
                return  # Already reviewed — do nothing

            now = timezone.now()

            for course in self.selected_courses.all():
                CourseAccess.objects.get_or_create(
                    user=self.user,
                    course=course,
                    defaults={
                        "payment_request": self,
                        "approved_by": reviewed_by_user,
                        "approved_at": now,
                    },
                )

            locked.status      = self.STATUS_APPROVED
            locked.reviewed_by = reviewed_by_user
            locked.reviewed_at = now
            locked.save(update_fields=["status", "reviewed_by", "reviewed_at"])

            # Keep self in sync so callers see the updated status
            self.status      = locked.status
            self.reviewed_by = locked.reviewed_by
            self.reviewed_at = locked.reviewed_at

    def reject(self, reviewed_by_user, note=""):
        """
        Reject this request. No CourseAccess records are created.
        The admin_note is shown to the student on the dashboard.
        """
        if self.status != self.STATUS_PENDING:
            return  # Already reviewed — do nothing

        self.status      = self.STATUS_REJECTED
        self.reviewed_by = reviewed_by_user
        self.reviewed_at = timezone.now()
        self.admin_note  = note
        self.save(update_fields=["status", "reviewed_by", "reviewed_at", "admin_note"])


# ---------------------------------------------------------------------------
# CourseAccess
# ---------------------------------------------------------------------------

class CourseAccess(models.Model):
    """
    One row = one course unlocked for one user.

    Created automatically when admin approves a PaymentRequest.
    Never created manually or from student-facing views.

    Access check:
        CourseAccess.objects.filter(user=user, course=course).exists()
    Or use the helper:
        from payments.access import has_course_access
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="course_accesses",
    )
    course = models.ForeignKey(
        "courses.Course",
        on_delete=models.CASCADE,
        related_name="course_accesses",
    )
    # Audit: which payment triggered this grant
    payment_request = models.ForeignKey(
        PaymentRequest,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="course_accesses",
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="granted_course_accesses",
    )
    approved_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ("user", "course")
        verbose_name = "Course Access"
        verbose_name_plural = "Course Accesses"
        indexes = [
            models.Index(fields=["user", "course"]),
            models.Index(fields=["user"]),
        ]

    def __str__(self):
        return f"{self.user.email} → {self.course.title}"
