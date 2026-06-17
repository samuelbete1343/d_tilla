from rest_framework import viewsets, permissions, status, views
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Quiz, Question, Choice, QuizAttempt, UserAnswer
from .serializers import QuizSerializer, QuizAttemptSerializer
from courses.models import Lesson
from payments.access import has_lesson_access

# HasActiveSubscription and the duplicate _has_lesson_access helper have
# been removed. Access is now checked via payments.access.has_lesson_access
# which uses CourseAccess records instead of subscription plan price.


class QuizViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class   = QuizSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Quiz.objects.all()

    def retrieve(self, request, pk=None):
        lesson = get_object_or_404(Lesson, id=pk)
        if not has_lesson_access(request.user, lesson.course, lesson):
            return Response(
                {"detail": "Subscription required for this quiz."},
                status=status.HTTP_403_FORBIDDEN,
            )
        quiz = get_object_or_404(Quiz, lesson=lesson)
        return Response(self.get_serializer(quiz).data)


class QuizSubmitView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, quiz_id):
        quiz = get_object_or_404(Quiz, id=quiz_id)
        if not has_lesson_access(request.user, quiz.lesson.course, quiz.lesson):
            return Response(
                {"detail": "Subscription required to submit this quiz."},
                status=status.HTTP_403_FORBIDDEN,
            )

        answers_data    = request.data.get('answers', [])
        questions       = {q.id: q for q in quiz.questions.all()}
        total_questions = len(questions)

        if total_questions == 0:
            return Response({"detail": "Quiz has no questions."}, status=status.HTTP_400_BAD_REQUEST)

        correct_choices = set(
            Choice.objects.filter(question__quiz=quiz, is_correct=True).values_list('id', flat=True)
        )
        attempt       = QuizAttempt.objects.create(user=request.user, quiz=quiz)
        correct_count = 0

        for ans in answers_data:
            question_id = ans.get('question_id')
            choice_id   = ans.get('choice_id')
            if question_id in questions:
                try:
                    choice_obj = Choice.objects.get(id=choice_id, question=questions[question_id])
                    UserAnswer.objects.create(attempt=attempt, question=questions[question_id], selected_choice=choice_obj)
                    if choice_id in correct_choices:
                        correct_count += 1
                except Choice.DoesNotExist:
                    pass

        score   = (correct_count / total_questions) * 100
        passed  = score >= quiz.passing_score
        attempt.score_percentage = score
        attempt.passed = passed
        attempt.save()

        return Response({"score_percentage": score, "passed": passed})


class MyAttemptsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        attempts   = QuizAttempt.objects.filter(user=request.user).order_by('-created_at')
        serializer = QuizAttemptSerializer(attempts, many=True)
        return Response(serializer.data)
