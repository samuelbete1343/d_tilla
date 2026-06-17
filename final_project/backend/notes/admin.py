from django.contrib import admin
from .models import Note


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display  = ['title', 'lesson', 'note_type', 'order_index', 'created_at']
    list_filter   = ['note_type', 'lesson__course']
    search_fields = ['title', 'lesson__title', 'lesson__course__title']
    ordering      = ['lesson__course', 'lesson__order_index', 'order_index']
