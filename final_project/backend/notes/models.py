"""
notes/models.py
Notes attached to a Lesson. Admin creates them; students read them.
"""
from django.db import models
from courses.models import Lesson


class Note(models.Model):
    NOTE_TYPE_CHOICES = (
        ('text', 'Text / Markdown'),
        ('pdf',  'PDF Download'),
    )

    lesson      = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='notes')
    title       = models.CharField(max_length=255)
    content     = models.TextField(
        blank=True,
        help_text="Plain text or Markdown. Used when note_type='text'."
    )
    note_type   = models.CharField(max_length=10, choices=NOTE_TYPE_CHOICES, default='text')
    pdf_file    = models.FileField(
        upload_to='lesson_notes/%Y/%m/',
        null=True, blank=True,
        help_text="Upload a PDF when note_type='pdf'."
    )
    order_index = models.PositiveIntegerField(default=0)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order_index']

    @property
    def pdf_url(self):
        if self.pdf_file:
            return self.pdf_file.url
        return None

    def __str__(self):
        return f"{self.lesson.title} — {self.title}"
