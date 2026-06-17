from rest_framework import serializers
from .models import Course, Lesson, Progress


class LessonSerializer(serializers.ModelSerializer):
    embed_url        = serializers.ReadOnlyField()
    thumbnail_url    = serializers.ReadOnlyField()
    duration_display = serializers.ReadOnlyField()
    # is_locked is injected dynamically in the lessons view, not a model field
    is_locked        = serializers.BooleanField(read_only=True, default=False)

    class Meta:
        model  = Lesson
        fields = [
            'id', 'title', 'description', 'order_index',
            'is_free_preview', 'duration_seconds', 'duration_display',
            'youtube_video_id', 'embed_url', 'thumbnail_url',
            'is_locked',
        ]


class CourseSerializer(serializers.ModelSerializer):
    access_count = serializers.ReadOnlyField()
    lesson_count = serializers.SerializerMethodField()

    class Meta:
        model  = Course
        fields = [
            'id', 'title', 'slug', 'description', 'category',
            'price', 'image',
            'is_published', 'access_count', 'lesson_count',
            'created_at', 'updated_at',
        ]

    def get_lesson_count(self, obj):
        return obj.lessons.count()


class CourseWithLessonsSerializer(CourseSerializer):
    """Used when returning a course with its full lesson list (retrieve action)."""
    lessons = LessonSerializer(many=True, read_only=True)

    class Meta(CourseSerializer.Meta):
        fields = CourseSerializer.Meta.fields + ['lessons']


class ProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model        = Progress
        fields       = ['id', 'lesson', 'is_completed', 'last_watched_position', 'updated_at']
        read_only_fields = ['lesson', 'updated_at']
