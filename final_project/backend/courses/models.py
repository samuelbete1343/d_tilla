"""
courses/models.py

FIX-PROD-3: Added `catalogue_code` field that exists in migration 0005
but was missing from this model file. Without it, any code referencing
Course.catalogue_code raises AttributeError at runtime.
"""
from django.db import models
from django.conf import settings
from django.utils.text import slugify
from .utils import extract_youtube_id


class Course(models.Model):
    # Access is controlled via payments.CourseAccess records.
    # No enrollment model. No plan-tier group membership.

    title        = models.CharField(max_length=255)
    slug         = models.SlugField(max_length=280, unique=True, blank=True)
    description  = models.TextField()
    category     = models.CharField(max_length=100)
    price        = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text="Display price only. Access is granted via CourseAccess, not price.",
    )
    image        = models.URLField(blank=True, null=True)
    is_published = models.BooleanField(
        default=False,
        help_text="Only published courses are visible to students.",
    )
    # FIX-PROD-3: This field was added in migration 0005 but was missing
    # from the model definition — caused AttributeError on access.
    catalogue_code = models.CharField(
        max_length=50,
        blank=True,
        db_index=True,
        help_text=(
            "Frontend course code from courseCatalogue.ts (e.g. 'FLEn-1011'). "
            "Used to bridge cart → backend PK. Set this in the admin for every published course."
        ),
    )
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    @property
    def access_count(self):
        """Number of students with an approved CourseAccess for this course."""
        return self.course_accesses.count()

    def __str__(self):
        status = "✓" if self.is_published else "✗"
        return f"[{status}] {self.title}"


class Lesson(models.Model):
    course           = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons')
    title            = models.CharField(max_length=255)
    description      = models.TextField(blank=True)
    order_index      = models.PositiveIntegerField(default=0, db_index=True)
    is_free_preview  = models.BooleanField(
        default=False,
        help_text="Free preview lessons are visible without a payment.",
    )
    duration_seconds = models.PositiveIntegerField(
        default=0,
        help_text="Video duration in seconds (fill manually for display).",
    )
    youtube_url      = models.URLField(
        max_length=500,
        blank=True,
        help_text="Paste the full YouTube URL here (e.g. https://youtu.be/abc123). "
                  "The video ID is extracted automatically.",
    )
    youtube_video_id = models.CharField(max_length=50, blank=True, editable=False)

    class Meta:
        ordering = ['order_index']

    def save(self, *args, **kwargs):
        if self.youtube_url:
            extracted = extract_youtube_id(self.youtube_url)
            if extracted:
                self.youtube_video_id = extracted
        super().save(*args, **kwargs)

    @property
    def embed_url(self):
        from .utils import youtube_embed_url
        return youtube_embed_url(self.youtube_video_id)

    @property
    def thumbnail_url(self):
        from .utils import youtube_thumbnail_url
        return youtube_thumbnail_url(self.youtube_video_id)

    @property
    def duration_display(self):
        if not self.duration_seconds:
            return ""
        m, s = divmod(self.duration_seconds, 60)
        h, m = divmod(m, 60)
        if h:
            return f"{h}:{m:02d}:{s:02d}"
        return f"{m}:{s:02d}"

    def __str__(self):
        return f"{self.course.title} — {self.order_index}. {self.title}"


class Progress(models.Model):
    user                  = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='progress_records')
    course                = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='progress_records')
    lesson                = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='progress_records')
    is_completed          = models.BooleanField(default=False)
    last_watched_position = models.IntegerField(default=0, help_text="Seconds into the video.")
    updated_at            = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'lesson')
        indexes = [
            models.Index(fields=['user', 'course']),
            models.Index(fields=['updated_at']),
        ]

    def __str__(self):
        status = "✓ Done" if self.is_completed else f"@ {self.last_watched_position}s"
        return f"{self.user} — {self.lesson.title} {status}"
