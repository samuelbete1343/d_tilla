"""
courses/migrations/0002_remove_access_group.py

FIX: The original 0002 tried to RemoveField 'access_group' from Course, but
that field was NEVER added in 0001_initial.py — the Phase 3 rewrite of 0001
already omitted it. Django raises:

    ValueError: Cannot find a field named 'access_group' on model Course.

This migration is now a NO-OP. It is kept so the dependency label
("courses", "0002_remove_access_group") stays valid for:
    payments/0001
    quizzes/0001
    notes/0001
"""
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("courses", "0001_initial"),
    ]

    operations = [
        # No-op: access_group was never in the Phase 3 0001_initial.
        # The field was removed from the model before 0001 was regenerated.
    ]
