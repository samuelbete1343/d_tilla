from django.urls import path
from .views import CourseNotesView, LessonNotesView, NotePDFDownloadView

urlpatterns = [
    path('course/<int:course_id>/', CourseNotesView.as_view(),    name='course-notes'),
    path('lesson/<int:lesson_id>/', LessonNotesView.as_view(),    name='lesson-notes'),
    # S3 FIX — authenticated PDF download, replaces raw /media/ URL
    path('pdf/<int:note_id>/',      NotePDFDownloadView.as_view(), name='note-pdf-download'),
]
