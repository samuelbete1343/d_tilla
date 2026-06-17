from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, LessonCompleteView, LessonProgressUpdateView

router = DefaultRouter()
router.register(r'', CourseViewSet, basename='course')

urlpatterns = [
    path('lesson/<int:lesson_id>/complete/', LessonCompleteView.as_view(),        name='lesson-complete'),
    path('lesson/<int:lesson_id>/progress/', LessonProgressUpdateView.as_view(),  name='lesson-progress'),
    path('', include(router.urls)),
]
