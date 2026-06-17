"""
courses/admin.py

Admin setup for Tilla courses.

Notes:
  - Enrollment model has been removed. Access stats now read from CourseAccess.
  - Progress admin is read-only (support/debugging only).
"""
from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Count

from .models import Course, Lesson, Progress


# ---------------------------------------------------------------------------
# Inline: Lessons inside Course
# ---------------------------------------------------------------------------

class LessonInline(admin.TabularInline):
    model           = Lesson
    extra           = 1
    fields          = (
        'order_index', 'title', 'is_free_preview',
        'youtube_url', 'youtube_video_id_display',
        'duration_seconds', 'thumbnail_preview',
    )
    readonly_fields = ('youtube_video_id_display', 'thumbnail_preview')
    ordering        = ('order_index',)

    def youtube_video_id_display(self, obj):
        if obj.youtube_video_id:
            return format_html(
                '<code style="background:#f3f4f6;padding:2px 6px;border-radius:4px">{}</code>',
                obj.youtube_video_id,
            )
        return "—"
    youtube_video_id_display.short_description = "Video ID"

    def thumbnail_preview(self, obj):
        if obj.youtube_video_id:
            return format_html(
                '<img src="https://img.youtube.com/vi/{}/default.jpg" '
                'style="height:45px;border-radius:4px;" />',
                obj.youtube_video_id,
            )
        return "—"
    thumbnail_preview.short_description = "Preview"


# ---------------------------------------------------------------------------
# Course Admin
# ---------------------------------------------------------------------------

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    inlines      = [LessonInline]
    list_display = (
        'title', 'category',
        'is_published', 'lesson_count', 'access_count_display',
        'created_at',
    )
    list_filter       = ('is_published', 'category')
    search_fields     = ('title', 'description', 'category')
    list_editable     = ('is_published',)
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields   = ('created_at', 'updated_at', 'access_count_display')
    ordering          = ('-created_at',)

    fieldsets = (
        ("Course Info", {
            'fields': ('title', 'slug', 'description', 'category', 'image'),
        }),
        ("Pricing", {
            'fields': ('price',),
            'description': (
                "Display price only. Access is controlled by CourseAccess records "
                "created when admin approves a PaymentRequest."
            ),
        }),
        ("Publishing", {
            'fields': ('is_published',),
            'description': (
                "⚠️  Set to Published only when the course has at least one lesson "
                "with a valid YouTube video."
            ),
        }),
        ("Stats (read-only)", {
            'fields': ('access_count_display', 'created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.annotate(_access_count=Count('course_accesses', distinct=True))

    def access_count_display(self, obj):
        return getattr(obj, '_access_count', obj.access_count)
    access_count_display.short_description = "Students with access"
    access_count_display.admin_order_field = '_access_count'

    def lesson_count(self, obj):
        return obj.lessons.count()
    lesson_count.short_description = "Lessons"

    actions = ['publish_courses', 'unpublish_courses']

    @admin.action(description="✅ Publish selected courses")
    def publish_courses(self, request, queryset):
        updated = queryset.update(is_published=True)
        self.message_user(request, f"{updated} course(s) published.")

    @admin.action(description="⛔ Unpublish selected courses")
    def unpublish_courses(self, request, queryset):
        updated = queryset.update(is_published=False)
        self.message_user(request, f"{updated} course(s) unpublished.")


# ---------------------------------------------------------------------------
# Lesson Admin
# ---------------------------------------------------------------------------

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display    = (
        'title', 'course', 'order_index',
        'is_free_preview', 'youtube_video_id', 'thumbnail_preview', 'duration_display',
    )
    list_filter     = ('course', 'is_free_preview')
    search_fields   = ('title', 'course__title', 'youtube_video_id')
    list_editable   = ('order_index', 'is_free_preview')
    ordering        = ('course', 'order_index')
    readonly_fields = ('youtube_video_id', 'embed_preview', 'thumbnail_preview', 'duration_display')

    fieldsets = (
        ("Lesson Info", {
            'fields': ('course', 'title', 'description', 'order_index', 'is_free_preview'),
        }),
        ("YouTube Video", {
            'fields': ('youtube_url', 'youtube_video_id', 'duration_seconds', 'embed_preview'),
            'description': (
                "Paste the full YouTube URL (Public or Unlisted). "
                "The video ID is extracted automatically when you save."
            ),
        }),
    )

    def embed_preview(self, obj):
        if not obj.youtube_video_id:
            return "No video linked yet."
        return format_html(
            '<iframe width="480" height="270" '
            'src="https://www.youtube.com/embed/{}" '
            'frameborder="0" allowfullscreen style="border-radius:8px"></iframe>',
            obj.youtube_video_id,
        )
    embed_preview.short_description = "Video Preview"

    def thumbnail_preview(self, obj):
        if obj.youtube_video_id:
            return format_html(
                '<img src="https://img.youtube.com/vi/{}/mqdefault.jpg" '
                'style="height:60px;border-radius:4px;" />',
                obj.youtube_video_id,
            )
        return "—"
    thumbnail_preview.short_description = "Thumbnail"


# ---------------------------------------------------------------------------
# Progress Admin — read-only (debugging / support)
# ---------------------------------------------------------------------------

@admin.register(Progress)
class ProgressAdmin(admin.ModelAdmin):
    list_display    = ('user', 'lesson', 'course', 'is_completed', 'last_watched_position', 'updated_at')
    list_filter     = ('is_completed', 'course')
    search_fields   = ('user__email', 'lesson__title', 'course__title')
    readonly_fields = ('user', 'course', 'lesson', 'updated_at')
    ordering        = ('-updated_at',)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
