"""
payments/access.py

Single source of truth for course access control.

Import this everywhere instead of duplicating access logic:

    from payments.access import has_course_access, has_lesson_access

Rules (Phase 1 — new system):
    - Staff/admin always have access.
    - A student has access to a course if a CourseAccess row exists for them.
    - A lesson is accessible if the parent course is accessible.
    - Free-preview lessons remain accessible without any payment (keeps
      the public preview UX intact during transition).

This module deliberately has no circular imports:
    payments.access → payments.models (CourseAccess)
                    → courses.models (Course, Lesson)
Neither courses nor quizzes import from payments.access at module level;
they import inside functions if needed, but the direct import is safe
because Django resolves app dependencies after all apps are loaded.
"""


def has_course_access(user, course) -> bool:
    """
    Return True if `user` is allowed to access `course`.

    Args:
        user:   A User model instance (request.user).
        course: A Course model instance.

    Returns:
        bool
    """
    # Unauthenticated users never get access
    if not user or not user.is_authenticated:
        return False

    # Staff/admin always have full access (for content review)
    if user.is_staff:
        return True

    # Check for a CourseAccess grant
    # Import here to avoid any potential circular import issues at module load
    from payments.models import CourseAccess
    return CourseAccess.objects.filter(user=user, course=course).exists()


def has_lesson_access(user, course, lesson) -> bool:
    """
    Return True if `user` is allowed to watch `lesson`.

    Free-preview lessons are always accessible (anonymous or authenticated)
    so students can preview content before paying.

    Args:
        user:   A User model instance (request.user).
        course: The Course this lesson belongs to.
        lesson: The Lesson being accessed.

    Returns:
        bool
    """
    # Free-preview lessons are always accessible — no payment required
    if lesson.is_free_preview:
        return True

    # All other lessons require a CourseAccess grant
    return has_course_access(user, course)
