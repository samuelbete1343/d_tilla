"""
notes/serializers.py

S3 FIX — pdf_url now returns the authenticated download endpoint
(/api/notes/pdf/<note_id>/) instead of the raw /media/ filesystem path.

Students can only reach the file after has_lesson_access() is verified
inside NotePDFDownloadView. The /media/ URL is never exposed.
"""
from rest_framework import serializers
from .models import Note


class NoteSerializer(serializers.ModelSerializer):
    pdf_url = serializers.SerializerMethodField()

    class Meta:
        model  = Note
        fields = [
            'id', 'title', 'content', 'note_type',
            'pdf_url', 'order_index', 'created_at',
        ]

    def get_pdf_url(self, obj):
        """
        S3 FIX: return the authenticated download URL, not the raw media path.
        NotePDFDownloadView verifies has_lesson_access before serving the file.
        """
        if not obj.pdf_file:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(f'/api/notes/pdf/{obj.id}/')
        return f'/api/notes/pdf/{obj.id}/'
