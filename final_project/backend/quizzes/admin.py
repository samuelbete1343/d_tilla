from django.contrib import admin
from .models import Quiz, Question, Choice, QuizAttempt, UserAnswer


class ChoiceInline(admin.TabularInline):
    model  = Choice
    extra  = 4
    fields = ('text', 'is_correct')


class QuestionInline(admin.StackedInline):
    model            = Question
    extra            = 1
    fields           = ('text', 'order_index')
    show_change_link = True


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display  = ('title', 'lesson', 'passing_score', 'created_at')
    search_fields = ('title', 'lesson__title')
    inlines       = [QuestionInline]


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display  = ('text', 'quiz', 'order_index')
    list_filter   = ('quiz',)
    inlines       = [ChoiceInline]


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display    = ('user', 'quiz', 'score_percentage', 'passed', 'created_at')
    list_filter     = ('passed', 'quiz')
    search_fields   = ('user__email',)
    readonly_fields = ('user', 'quiz', 'score_percentage', 'passed', 'created_at')

    def has_add_permission(self, request):
        return False
