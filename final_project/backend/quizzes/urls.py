from django.urls import path
from .views import QuizViewSet, QuizSubmitView, MyAttemptsView

urlpatterns = [
    path('<int:pk>/', QuizViewSet.as_view({'get': 'retrieve'}), name='lesson-quiz'),
    path('<int:quiz_id>/submit/', QuizSubmitView.as_view(), name='quiz-submit'),
    path('my-attempts/', MyAttemptsView.as_view(), name='quiz-my-attempts'),
]
