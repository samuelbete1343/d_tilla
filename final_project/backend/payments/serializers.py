"""
payments/serializers.py
"""
from rest_framework import serializers
from courses.models import Course
from .models import PaymentRequest, CourseAccess, MAX_COURSES_PER_REQUEST, PAYMENT_AMOUNT_ETB


# ---------------------------------------------------------------------------
# Minimal course representation for payment context
# ---------------------------------------------------------------------------

class CourseSlimSerializer(serializers.ModelSerializer):
    """Lightweight course info returned inside payment/access responses."""

    class Meta:
        model  = Course
        fields = ["id", "title", "slug", "category", "image", "is_published"]
        read_only_fields = fields


# ---------------------------------------------------------------------------
# PaymentRequest — student-facing (submit + status)
# ---------------------------------------------------------------------------

class PaymentRequestCreateSerializer(serializers.Serializer):
    """
    Used for POST /api/payments/request/

    Accepts a list of course IDs, validates the 7-course cap, creates
    the PaymentRequest and links the M2M in one operation.

    We use a plain Serializer (not ModelSerializer) because the M2M
    cannot be set before the instance is saved, so we handle creation
    manually in validated_data.
    """
    selected_course_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        min_length=1,
        max_length=MAX_COURSES_PER_REQUEST,
        error_messages={
            "min_length": "You must select at least 1 course.",
            "max_length": f"You can select at most {MAX_COURSES_PER_REQUEST} courses.",
        },
    )

    def validate_selected_course_ids(self, course_ids):
        # Deduplicate — no double-selecting the same course
        unique_ids = list(dict.fromkeys(course_ids))

        # Verify all IDs exist and are published
        courses = Course.objects.filter(id__in=unique_ids, is_published=True)
        found_ids = set(courses.values_list("id", flat=True))
        missing = set(unique_ids) - found_ids
        if missing:
            raise serializers.ValidationError(
                f"Course ID(s) not found or not available: {sorted(missing)}"
            )

        if len(unique_ids) > MAX_COURSES_PER_REQUEST:
            raise serializers.ValidationError(
                f"You can select at most {MAX_COURSES_PER_REQUEST} courses. "
                f"You selected {len(unique_ids)}."
            )

        # Attach the queryset so the view doesn't re-query
        self._courses = courses
        return unique_ids

    def validate(self, attrs):
        user = self.context["request"].user

        # Block a second pending request — student must wait for review
        already_pending = PaymentRequest.objects.filter(
            user=user,
            status=PaymentRequest.STATUS_PENDING,
        ).exists()
        if already_pending:
            raise serializers.ValidationError(
                "You already have a pending payment request. "
                "Please wait for admin review before submitting another."
            )

        return attrs

    def create(self, validated_data):
        user = self.context["request"].user
        courses = self._courses  # set in validate_selected_course_ids

        payment_request = PaymentRequest.objects.create(
            user=user,
            amount=PAYMENT_AMOUNT_ETB,
            status=PaymentRequest.STATUS_PENDING,
        )
        payment_request.selected_courses.set(courses)
        return payment_request


class PaymentRequestReadSerializer(serializers.ModelSerializer):
    """
    Used for GET /api/payments/my-request/ and admin list.
    Returns full detail including the selected courses.
    """
    selected_courses = CourseSlimSerializer(many=True, read_only=True)
    reviewed_by_email = serializers.SerializerMethodField()
    status_display    = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model  = PaymentRequest
        fields = [
            "id",
            "status",
            "status_display",
            "amount",
            "selected_courses",
            "admin_note",
            "reviewed_by_email",
            "created_at",
            "reviewed_at",
        ]
        read_only_fields = fields

    def get_reviewed_by_email(self, obj):
        return obj.reviewed_by.email if obj.reviewed_by else None


# ---------------------------------------------------------------------------
# CourseAccess — student-facing (unlocked courses)
# ---------------------------------------------------------------------------

class CourseAccessSerializer(serializers.ModelSerializer):
    """
    Used for GET /api/payments/my-access/
    Returns the list of courses the student has unlocked.
    """
    course      = CourseSlimSerializer(read_only=True)
    approved_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model  = CourseAccess
        fields = ["id", "course", "approved_at"]
        read_only_fields = fields


# ---------------------------------------------------------------------------
# Dashboard summary — single lightweight endpoint
# ---------------------------------------------------------------------------

class PaymentStatusSummarySerializer(serializers.Serializer):
    """
    Lightweight payload for GET /api/payments/status/
    Used by the Dashboard to decide which UI state to render.
    """
    has_pending_request   = serializers.BooleanField()
    has_approved_request  = serializers.BooleanField()
    has_rejected_request  = serializers.BooleanField()
    unlocked_course_count = serializers.IntegerField()
    max_courses           = serializers.IntegerField()
    # Latest request detail (may be null if no requests exist)
    latest_request        = PaymentRequestReadSerializer(allow_null=True)
