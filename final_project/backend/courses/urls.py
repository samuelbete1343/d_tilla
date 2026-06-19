from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, LessonCompleteView, LessonProgressUpdateView
from .import_views import BulkCourseImportView

router = DefaultRouter()
router.register(r'', CourseViewSet, basename='course')

urlpatterns = [
    # Bulk import — staff only, POST multipart/form-data with field "file"
    path('import/', BulkCourseImportView.as_view(), name='course-bulk-import'),

    # Lesson progress
    path('lesson/<int:lesson_id>/complete/', LessonCompleteView.as_view(),       name='lesson-complete'),
    path('lesson/<int:lesson_id>/progress/', LessonProgressUpdateView.as_view(), name='lesson-progress'),

    # Course viewset (list, retrieve, lessons, progress, resume)
    path('', include(router.urls)),
]
