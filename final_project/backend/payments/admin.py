"""
payments/admin.py

Admin interface for the new payment system.

Key features:
  - PaymentRequest list shows student, status badge, course count, date
  - Inline display of selected courses on the detail page
  - "Approve" bulk action → calls PaymentRequest.approve() → creates CourseAccess rows
  - "Reject" bulk action  → calls PaymentRequest.reject()  → no access granted
  - CourseAccess list for audit/support (read-only, no add/delete)
  - Admin cannot manually create PaymentRequests (students submit via API)
"""
from django.contrib import admin
from django.utils import timezone
from django.utils.html import format_html
from django.db.models import Count

from .models import PaymentRequest, CourseAccess


# ---------------------------------------------------------------------------
# Inline: Selected courses inside PaymentRequest detail
# ---------------------------------------------------------------------------

class SelectedCourseInline(admin.TabularInline):
    """
    Read-only display of which courses the student selected.
    Shown on the PaymentRequest change page so admin can review before approving.
    """
    model        = PaymentRequest.selected_courses.through  # M2M through table
    verbose_name = "Selected Course"
    verbose_name_plural = "Selected Courses"
    extra        = 0
    can_delete   = False
    readonly_fields = ("course_title", "course_category", "course_published")

    def course_title(self, obj):
        return obj.course.title
    course_title.short_description = "Title"

    def course_category(self, obj):
        return obj.course.category
    course_category.short_description = "Category"

    def course_published(self, obj):
        return "✓" if obj.course.is_published else "✗"
    course_published.short_description = "Published"

    def has_add_permission(self, request, obj=None):
        return False


# ---------------------------------------------------------------------------
# PaymentRequest Admin
# ---------------------------------------------------------------------------

@admin.register(PaymentRequest)
class PaymentRequestAdmin(admin.ModelAdmin):
    list_display = (
        "student_email",
        "course_count",
        "amount_display",
        "status_badge",
        "reviewed_by_email",
        "created_at",
        "reviewed_at",
    )
    list_filter  = ("status",)
    search_fields = ("user__email", "user__full_name")
    readonly_fields = (
        "user",
        "amount",
        "status",
        "reviewed_by",
        "created_at",
        "reviewed_at",
    )
    ordering = ("-created_at",)
    inlines  = [SelectedCourseInline]

    fieldsets = (
        ("Student & Payment", {
            "fields": ("user", "amount", "status", "created_at"),
        }),
        ("Admin Review", {
            "fields": ("reviewed_by", "reviewed_at", "admin_note"),
            "description": (
                "Use the ✅ Approve / ❌ Reject actions from the list page. "
                "Write a note below before rejecting — it will be shown to the student."
            ),
        }),
    )

    # Admin cannot create PaymentRequests — students submit via API
    def has_add_permission(self, request):
        return False

    # ---- Display helpers ------------------------------------------------

    def student_email(self, obj):
        return obj.user.email
    student_email.short_description = "Student"
    student_email.admin_order_field = "user__email"

    def course_count(self, obj):
        # Annotated in get_queryset for efficiency
        count = getattr(obj, "_course_count", obj.selected_courses.count())
        return f"{count} course(s)"
    course_count.short_description = "Courses"

    def amount_display(self, obj):
        return f"{obj.amount} ETB"
    amount_display.short_description = "Amount"

    def status_badge(self, obj):
        colors = {
            "pending":  "#f59e0b",
            "approved": "#10b981",
            "rejected": "#ef4444",
        }
        color = colors.get(obj.status, "#6b7280")
        return format_html(
            '<span style="background:{};color:white;padding:2px 10px;'
            'border-radius:12px;font-size:11px;font-weight:bold">{}</span>',
            color,
            obj.get_status_display(),
        )
    status_badge.short_description = "Status"

    def reviewed_by_email(self, obj):
        return obj.reviewed_by.email if obj.reviewed_by else "—"
    reviewed_by_email.short_description = "Reviewed By"

    # Annotate course count so `course_count()` avoids N+1
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.annotate(_course_count=Count("selected_courses")).select_related(
            "user", "reviewed_by"
        )

    # ---- Bulk actions ---------------------------------------------------

    actions = ["approve_payments", "reject_payments"]

    @admin.action(description="✅ Approve selected payments and grant course access")
    def approve_payments(self, request, queryset):
        approved = 0
        skipped  = 0

        for payment in queryset.prefetch_related("selected_courses"):
            if payment.status != PaymentRequest.STATUS_PENDING:
                skipped += 1
                continue

            payment.approve(reviewed_by_user=request.user)
            approved += 1

        msg = f"{approved} payment request(s) approved. Course access granted automatically."
        if skipped:
            msg += f" {skipped} skipped (already reviewed)."
        self.message_user(request, msg)

    @admin.action(description="❌ Reject selected payments")
    def reject_payments(self, request, queryset):
        rejected = 0
        skipped  = 0

        for payment in queryset:
            if payment.status != PaymentRequest.STATUS_PENDING:
                skipped += 1
                continue

            payment.reject(
                reviewed_by_user=request.user,
                note="Payment could not be verified. Please contact support via Telegram.",
            )
            rejected += 1

        msg = f"{rejected} payment request(s) rejected."
        if skipped:
            msg += f" {skipped} skipped (already reviewed)."
        self.message_user(request, msg)


# ---------------------------------------------------------------------------
# CourseAccess Admin (read-only audit view)
# ---------------------------------------------------------------------------

@admin.register(CourseAccess)
class CourseAccessAdmin(admin.ModelAdmin):
    """
    Read-only view for auditing which courses each student has access to.
    Admin can revoke access by deleting a row if needed.
    """
    list_display  = (
        "student_email",
        "course_title",
        "course_category",
        "approved_by_email",
        "approved_at",
    )
    list_filter   = ("course__category",)
    search_fields = ("user__email", "user__full_name", "course__title")
    readonly_fields = (
        "user", "course", "payment_request", "approved_by", "approved_at"
    )
    ordering = ("-approved_at",)

    def student_email(self, obj):
        return obj.user.email
    student_email.short_description = "Student"
    student_email.admin_order_field = "user__email"

    def course_title(self, obj):
        return obj.course.title
    course_title.short_description = "Course"
    course_title.admin_order_field = "course__title"

    def course_category(self, obj):
        return obj.course.category
    course_category.short_description = "Category"

    def approved_by_email(self, obj):
        return obj.approved_by.email if obj.approved_by else "—"
    approved_by_email.short_description = "Approved By"

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            "user", "course", "approved_by", "payment_request"
        )

    # Admin cannot manually create CourseAccess rows — approval does it
    def has_add_permission(self, request):
        return False
