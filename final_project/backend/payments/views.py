"""
payments/views.py

Student-facing endpoints only. Admin actions live in payments/admin.py.

Endpoints:
    POST /api/payments/request/      — submit course selection
    GET  /api/payments/my-request/   — latest payment request + status
    GET  /api/payments/my-access/    — list of unlocked courses
    GET  /api/payments/status/       — lightweight dashboard summary

All views require authentication (global DRF default).
"""
import logging

from rest_framework import status, views
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle

from .models import PaymentRequest, CourseAccess, MAX_COURSES_PER_REQUEST
from .serializers import (
    PaymentRequestCreateSerializer,
    PaymentRequestReadSerializer,
    CourseAccessSerializer,
    PaymentStatusSummarySerializer,
)

logger = logging.getLogger(__name__)


class PaymentSubmitThrottle(UserRateThrottle):
    """
    Limit payment submissions to 5 per hour per authenticated user.

    The serializer already blocks a second pending request, but without
    this throttle a malicious actor with a valid token could still hammer
    the endpoint to probe for race conditions or exhaust DB write capacity.
    """
    scope = "payment_submit"


# ---------------------------------------------------------------------------
# Submit payment request
# ---------------------------------------------------------------------------

class SubmitPaymentRequestView(views.APIView):
    """
    POST /api/payments/request/

    Student selects up to 7 courses and submits for admin review.
    No file uploads. No plan selection. Fixed 100 ETB.

    Request body:
        { "selected_course_ids": [1, 3, 7, 12, 14, 15, 16] }

    Errors:
        400 — invalid course IDs, >7 courses, or pending request already exists
        429 — too many submissions (5/hour throttle)
    """
    permission_classes = [IsAuthenticated]
    throttle_classes   = [PaymentSubmitThrottle]

    def post(self, request):
        serializer = PaymentRequestCreateSerializer(
            data=request.data,
            context={"request": request},
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        payment_request = serializer.save()
        logger.info(
            "PaymentRequest #%s created for user %s (%d courses)",
            payment_request.pk,
            request.user.email,
            payment_request.selected_courses.count(),
        )

        read_serializer = PaymentRequestReadSerializer(
            payment_request,
            context={"request": request},
        )
        return Response(read_serializer.data, status=status.HTTP_201_CREATED)


# ---------------------------------------------------------------------------
# My latest payment request
# ---------------------------------------------------------------------------

class MyPaymentRequestView(views.APIView):
    """
    GET /api/payments/my-request/

    Returns the student's most recent PaymentRequest (any status).
    Returns 404 if no request has been submitted yet.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        latest = (
            PaymentRequest.objects
            .filter(user=request.user)
            .prefetch_related("selected_courses")
            .select_related("reviewed_by")
            .first()  # ordered by -created_at in Meta
        )
        if latest is None:
            return Response(
                {"detail": "No payment request found. Please select your courses to get started."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = PaymentRequestReadSerializer(latest, context={"request": request})
        return Response(serializer.data)


# ---------------------------------------------------------------------------
# My unlocked courses
# ---------------------------------------------------------------------------

class MyCourseAccessView(views.APIView):
    """
    GET /api/payments/my-access/

    Returns the list of CourseAccess records for the current student,
    each containing the unlocked course details.

    Used by:
        - Dashboard "My Courses" section
        - Course detail page to show lock/unlock state
        - Lesson list to gate content
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        accesses = (
            CourseAccess.objects
            .filter(user=request.user)
            .select_related("course")
            .order_by("approved_at")
        )
        serializer = CourseAccessSerializer(accesses, many=True, context={"request": request})
        return Response(serializer.data)


# ---------------------------------------------------------------------------
# Dashboard status summary
# ---------------------------------------------------------------------------

class PaymentStatusView(views.APIView):
    """
    GET /api/payments/status/

    Lightweight endpoint the Dashboard calls once to determine which UI
    state to show:
        - No request submitted yet  → show "Select your 7 courses" CTA
        - Pending                   → show "Payment Pending Review" state
        - Approved                  → show unlocked courses
        - Rejected                  → show rejection reason + retry CTA
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        requests = PaymentRequest.objects.filter(user=request.user).prefetch_related(
            "selected_courses"
        ).select_related("reviewed_by")

        latest = requests.first()  # ordered by -created_at

        unlocked_count = CourseAccess.objects.filter(user=request.user).count()

        data = {
            "has_pending_request":   requests.filter(status=PaymentRequest.STATUS_PENDING).exists(),
            "has_approved_request":  requests.filter(status=PaymentRequest.STATUS_APPROVED).exists(),
            "has_rejected_request":  requests.filter(status=PaymentRequest.STATUS_REJECTED).exists(),
            "unlocked_course_count": unlocked_count,
            "max_courses":           MAX_COURSES_PER_REQUEST,
            "latest_request":        latest,
        }

        serializer = PaymentStatusSummarySerializer(data, context={"request": request})
        return Response(serializer.data)
