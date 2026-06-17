"""
courses/views.py

Access gate: payments.CourseAccess is the single source of truth.
Enrollment has been removed from this codebase.

Endpoints (all via CourseViewSet + standalone views):
    GET  /api/courses/                          — public list
    GET  /api/courses/<id>/                     — public detail (no lessons)
    GET  /api/courses/<id>/lessons/             — lesson list with is_locked flag
    GET  /api/courses/<id>/progress/            — course completion summary
    GET  /api/courses/<id>/resume/              — next lesson to watch
    POST /api/courses/lesson/<id>/complete/     — mark lesson complete
    POST /api/courses/lesson/<id>/progress/     — save playback position
"""
import logging
from rest_framework import viewsets, permissions, status, views
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Course, Lesson, Progress
from .serializers import (
    CourseSerializer,
    CourseWithLessonsSerializer,
    LessonSerializer,
)
from payments.access import has_course_access, has_lesson_access

logger = logging.getLogger(__name__)


class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public:   list, retrieve
    Students: lessons, progress, resume
    """

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return Course.objects.all()
        return Course.objects.filter(is_published=True)

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CourseWithLessonsSerializer
        return CourseSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    # ------------------------------------------------------------------ #
    # GET /api/courses/<id>/lessons/
    # ------------------------------------------------------------------ #

    @action(detail=True, methods=['get'])
    def lessons(self, request, pk=None):
        """
        Returns the lesson list for a course.

        Access rules:
          - Course must be published (or user is staff).
          - User must have a CourseAccess grant for the course.
          - Locked lessons still appear in the list but youtube_video_id
            and embed_url are blanked so the client cannot play them.
        """
        course = self.get_object()

        if not has_course_access(request.user, course):
            return Response(
                {"detail": "You do not have access to this course. "
                           "Please complete the payment process."},
                status=status.HTTP_403_FORBIDDEN,
            )

        result = []
        for lesson in course.lessons.all():
            access = has_lesson_access(request.user, course, lesson)
            data = LessonSerializer(lesson).data
            data['is_locked'] = not access
            if not access:
                data['youtube_video_id'] = ""
                data['embed_url'] = ""
            result.append(data)

        return Response(result)

    # ------------------------------------------------------------------ #
    # GET /api/courses/<id>/progress/
    # ------------------------------------------------------------------ #

    @action(detail=True, methods=['get'])
    def progress(self, request, pk=None):
        """Returns total/completed lesson counts and percentage."""
        course = self.get_object()

        if not has_course_access(request.user, course):
            return Response(
                {"detail": "Course access required."},
                status=status.HTTP_403_FORBIDDEN,
            )

        total     = course.lessons.count()
        completed = Progress.objects.filter(
            user=request.user, course=course, is_completed=True,
        ).count()

        return Response({
            "total_lessons":       total,
            "completed_lessons":   completed,
            "progress_percentage": int((completed / total) * 100) if total else 0,
        })

    # ------------------------------------------------------------------ #
    # GET /api/courses/<id>/resume/
    # ------------------------------------------------------------------ #

    @action(detail=True, methods=['get'])
    def resume(self, request, pk=None):
        """
        Returns the lesson the student should watch next.

        Response:
            { "next_lesson_id": <int>, "last_watched_time": <int seconds> }
        """
        course = self.get_object()

        if not has_course_access(request.user, course):
            return Response(
                {"detail": "Course access required."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Most recently updated progress record
        latest = (
            Progress.objects
            .filter(user=request.user, course=course)
            .select_related('lesson')
            .order_by('-updated_at')
            .first()
        )

        if latest:
            return Response({
                "next_lesson_id":    latest.lesson.id,
                "last_watched_time": latest.last_watched_position,
            })

        # No progress yet — start from the first lesson
        first = course.lessons.order_by('order_index').first()
        if first:
            return Response({"next_lesson_id": first.id, "last_watched_time": 0})

        return Response(
            {"detail": "No lessons available."},
            status=status.HTTP_404_NOT_FOUND,
        )


# ---------------------------------------------------------------------------
# POST /api/courses/lesson/<id>/complete/
# ---------------------------------------------------------------------------

class LessonCompleteView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, lesson_id):
        """Mark a lesson as completed. Requires CourseAccess."""
        lesson = get_object_or_404(Lesson, id=lesson_id)

        if not has_lesson_access(request.user, lesson.course, lesson):
            return Response(
                {"detail": "Course access required."},
                status=status.HTTP_403_FORBIDDEN,
            )

        progress, _ = Progress.objects.get_or_create(
            user=request.user,
            lesson=lesson,
            defaults={'course': lesson.course},
        )
        progress.is_completed = True
        progress.save(update_fields=['is_completed', 'updated_at'])

        return Response({
            "lesson_id":             lesson.id,
            "is_completed":          True,
            "last_watched_position": progress.last_watched_position,
        })


# ---------------------------------------------------------------------------
# POST /api/courses/lesson/<id>/progress/
# ---------------------------------------------------------------------------

class LessonProgressUpdateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, lesson_id):
        """
        Save playback position. Called by the frontend every ~30 seconds.
        Body: { "current_time": <seconds> }
        """
        lesson = get_object_or_404(Lesson, id=lesson_id)

        if not has_lesson_access(request.user, lesson.course, lesson):
            return Response(
                {"detail": "Course access required."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            current_time = int(float(request.data.get('current_time', 0)))
        except (ValueError, TypeError):
            return Response(
                {"detail": "current_time must be a number."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        progress, _ = Progress.objects.get_or_create(
            user=request.user,
            lesson=lesson,
            defaults={'course': lesson.course},
        )
        progress.last_watched_position = current_time
        progress.save(update_fields=['last_watched_position', 'updated_at'])

        return Response({
            "lesson_id":             lesson.id,
            "is_completed":          progress.is_completed,
            "last_watched_position": progress.last_watched_position,
        })
