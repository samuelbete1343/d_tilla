"""
notes/views.py

GET  /api/notes/course/<course_id>/    — all lessons + notes for a course
GET  /api/notes/lesson/<lesson_id>/    — notes for a single lesson
GET  /api/notes/pdf/<note_id>/         — authenticated PDF download (S3 FIX)

Access gate: payments.CourseAccess via has_course_access() / has_lesson_access().
Enrollment has been removed from this codebase.

S3 SECURITY FIX — PDF download endpoint:
    PDF files are stored under MEDIA_ROOT and served from /media/.
    Without authentication, any URL-guesser can download lesson PDFs without
    paying. The NoteSerializer no longer returns the raw /media/ URL.
    Instead it returns /api/notes/pdf/<note_id>/ which gates on has_lesson_access
    before streaming the file.

    In production with nginx, swap FileResponse for X-Accel-Redirect.
"""
import logging
import os
from django.http import FileResponse, Http404
from rest_framework import permissions, status, views
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from courses.models import Course, Lesson
from payments.access import has_course_access, has_lesson_access
from .models import Note
from .serializers import NoteSerializer

logger = logging.getLogger(__name__)


class CourseNotesView(views.APIView):
    """
    GET /api/notes/course/<course_id>/
    Returns all lessons with their notes.
    Locked lessons (no CourseAccess) return notes=[].
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, course_id):
        course = get_object_or_404(Course, id=course_id, is_published=True)

        if not has_course_access(request.user, course):
            return Response(
                {"detail": "You do not have access to this course."},
                status=status.HTTP_403_FORBIDDEN,
            )

        result = []
        for lesson in course.lessons.prefetch_related('notes').all():
            has_access = has_lesson_access(request.user, course, lesson)
            result.append({
                "id":          lesson.id,
                "title":       lesson.title,
                "order_index": lesson.order_index,
                "is_locked":   not has_access,
                "notes": (
                    NoteSerializer(
                        lesson.notes.all(), many=True, context={'request': request}
                    ).data
                    if has_access else []
                ),
            })

        return Response({"id": course.id, "title": course.title, "lessons": result})


class LessonNotesView(views.APIView):
    """
    GET /api/notes/lesson/<lesson_id>/
    Returns notes for a single lesson.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, lesson_id):
        lesson = get_object_or_404(Lesson, id=lesson_id)
        course = lesson.course

        if not has_lesson_access(request.user, course, lesson):
            return Response(
                {"detail": "Course access required for this lesson's notes."},
                status=status.HTTP_403_FORBIDDEN,
            )

        notes = lesson.notes.all()
        return Response(NoteSerializer(notes, many=True, context={'request': request}).data)


class NotePDFDownloadView(views.APIView):
    """
    GET /api/notes/pdf/<note_id>/

    S3 FIX — Authenticated PDF download.
    Streams the PDF only after verifying has_lesson_access.
    The raw /media/ URL is never returned to the client.

    Production nginx tip:
        Replace FileResponse with:
            response = HttpResponse()
            response['X-Accel-Redirect'] = f'/private-media/{note.pdf_file.name}'
            response['Content-Type'] = 'application/pdf'
            return response
        This offloads file serving to nginx while the access check stays in Django.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, note_id):
        note   = get_object_or_404(Note, id=note_id)
        lesson = note.lesson
        course = lesson.course

        if not has_lesson_access(request.user, course, lesson):
            return Response(
                {"detail": "Course access required to download this file."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if not note.pdf_file:
            raise Http404("No PDF attached to this note.")

        if not os.path.exists(note.pdf_file.path):
            logger.error("PDF missing on disk for Note #%s: %s", note.id, note.pdf_file.name)
            raise Http404("File not found.")

        file_handle = note.pdf_file.open('rb')
        filename    = os.path.basename(note.pdf_file.name)
        return FileResponse(
            file_handle,
            content_type='application/pdf',
            as_attachment=True,
            filename=filename,
        )
