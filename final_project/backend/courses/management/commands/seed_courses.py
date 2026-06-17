"""
courses/management/commands/seed_courses.py

Development-only seed command.
Creates realistic Course + Lesson records for local testing.

Usage:
    python manage.py seed_courses              # 10 courses, ~5 lessons each
    python manage.py seed_courses --courses 25 --lessons 8
    python manage.py seed_courses --clear      # wipe existing seed data first
"""

import random
from decimal import Decimal

from django.core.management.base import BaseCommand, CommandError
from django.utils.text import slugify

from courses.models import Course, Lesson


# ---------------------------------------------------------------------------
# Realistic seed data pools
# ---------------------------------------------------------------------------

CATEGORIES = [
    "Web Development",
    "Data Science",
    "Machine Learning",
    "Mobile Development",
    "DevOps & Cloud",
    "Cybersecurity",
    "UI/UX Design",
    "Business & Finance",
]

COURSE_TEMPLATES = [
    # (title_template, category)
    ("Complete {lang} Bootcamp: Zero to Hero",           "Web Development"),
    ("Build REST APIs with {lang} and Django",           "Web Development"),
    ("Full-Stack {lang} Development Masterclass",        "Web Development"),
    ("React + {lang} Backend: The Full Picture",         "Web Development"),
    ("{lang} for Data Science: Hands-On Projects",       "Data Science"),
    ("SQL & {lang}: Data Analysis from Scratch",         "Data Science"),
    ("Machine Learning with {lang}: A–Z",                "Machine Learning"),
    ("Deep Learning & Neural Networks in {lang}",        "Machine Learning"),
    ("iOS App Development with {lang}",                  "Mobile Development"),
    ("Android Development with {lang}",                  "Mobile Development"),
    ("Docker & Kubernetes: {lang} Microservices",        "DevOps & Cloud"),
    ("AWS Cloud Practitioner + {lang} Automation",       "DevOps & Cloud"),
    ("Ethical Hacking & {lang} Scripting",               "Cybersecurity"),
    ("Penetration Testing: Hands-On {lang}",             "Cybersecurity"),
    ("UI/UX Design Principles with {lang} Prototypes",   "UI/UX Design"),
    ("Figma to Code: {lang} Frontend Workflow",          "UI/UX Design"),
    ("Financial Modelling with {lang}",                  "Business & Finance"),
    ("Startup Growth Hacking: {lang} Data Tools",        "Business & Finance"),
]

LANGS = ["Python", "JavaScript", "TypeScript", "Go", "Rust", "Java", "Kotlin", "Swift"]

DESCRIPTION_SENTENCES = [
    "This course takes you from absolute beginner to confident practitioner through project-based learning.",
    "You will build real-world applications that you can add directly to your portfolio.",
    "Every concept is explained with clear diagrams, live coding sessions, and downloadable resources.",
    "The curriculum is updated regularly to reflect the latest industry standards and best practices.",
    "By the end, you will be able to architect, build, and deploy production-ready systems.",
    "Exercises and quizzes after each section reinforce what you have learned before you move on.",
    "You will join a community of over 50 000 students who have already completed this programme.",
    "No prior experience is required — just a computer and the willingness to learn.",
    "Lifetime access is included, so you can revisit any topic whenever you need a refresher.",
    "Certificate of completion is issued automatically once you finish all lessons.",
]

LESSON_TITLE_TEMPLATES = [
    "Introduction & Course Overview",
    "Setting Up Your Development Environment",
    "Core Concepts: {topic} Fundamentals",
    "Hands-On Project: Building Your First {topic} App",
    "Deep Dive: Advanced {topic} Patterns",
    "Testing & Debugging {topic} Code",
    "Performance Optimisation Techniques",
    "Security Best Practices for {topic}",
    "Deploying {topic} Applications to the Cloud",
    "Wrap-Up, Next Steps & Further Resources",
]

LESSON_TOPICS = [
    "API", "Database", "Authentication", "Frontend", "Backend",
    "Component", "Service", "Pipeline", "Model", "Interface",
]

# YouTube video IDs that actually exist (Rick Astley, Big Buck Bunny, etc.)
# Using safe, real public video IDs for dev seeds so embed preview works.
SAFE_YOUTUBE_IDS = [
    "dQw4w9WgXcQ",  # Rick Astley — Never Gonna Give You Up
    "aqz-KE-bpKQ",  # Big Buck Bunny
    "YE7VzlLtp-4",  # Django tutorial (sentdex)
    "F5mRW0jo-U4",  # Python crash course
    "rfscVS0vtbw",  # Learn Python (freeCodeCamp)
    "PkZNo7MFNFg",  # Learn JavaScript (freeCodeCamp)
    "Ke90Tje7VS0",  # React crash course
    "eIrMbAQSU34",  # Django REST framework
    "jS4aFq5-91M",  # JavaScript tutorial
    "W6NZfCO5SIk",  # JavaScript (Traversy)
]

PRICES = [
    Decimal("0.00"),   # free
    Decimal("9.99"),
    Decimal("19.99"),
    Decimal("29.99"),
    Decimal("49.99"),
    Decimal("79.99"),
    Decimal("99.99"),
    None,              # null  — field is nullable
]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_description(n_sentences: int = 3) -> str:
    return " ".join(random.sample(DESCRIPTION_SENTENCES, k=min(n_sentences, len(DESCRIPTION_SENTENCES))))


def _unique_slug(base_slug: str, existing: set) -> str:
    """Append a numeric suffix until the slug is unique."""
    slug = base_slug
    counter = 1
    while slug in existing:
        slug = f"{base_slug}-{counter}"
        counter += 1
    existing.add(slug)
    return slug


def _build_course_obj(template: tuple, lang: str, existing_slugs: set) -> Course:
    title_tpl, category = template
    title = title_tpl.format(lang=lang)
    slug = _unique_slug(slugify(title), existing_slugs)
    return Course(
        title=title,
        slug=slug,
        description=_make_description(random.randint(2, 4)),
        category=category,
        price=random.choice(PRICES),
        image=f"https://picsum.photos/seed/{slug}/800/450",  # deterministic placeholder
        is_published=random.choice([True, True, True, False]),  # 75 % published
    )


def _build_lesson_objs(course: Course, n: int) -> list:
    """Return n Lesson instances (unsaved) for the given course."""
    lessons = []
    titles_used: set[str] = set()

    for order_index in range(1, n + 1):
        topic = random.choice(LESSON_TOPICS)
        title_tpl = LESSON_TITLE_TEMPLATES[(order_index - 1) % len(LESSON_TITLE_TEMPLATES)]
        title = title_tpl.format(topic=topic)

        # Deduplicate within a course
        unique_title = title
        suffix = 1
        while unique_title in titles_used:
            unique_title = f"{title} (Part {suffix})"
            suffix += 1
        titles_used.add(unique_title)

        video_id = random.choice(SAFE_YOUTUBE_IDS)
        lessons.append(
            Lesson(
                course=course,
                title=unique_title,
                description=_make_description(1),
                order_index=order_index,
                is_free_preview=(order_index <= 2),           # first 2 lessons always free
                duration_seconds=random.randint(180, 3600),   # 3 min – 1 hr
                youtube_url=f"https://www.youtube.com/watch?v={video_id}",
                youtube_video_id=video_id,                    # pre-fill so bulk_create skips save()
            )
        )
    return lessons


# ---------------------------------------------------------------------------
# Command
# ---------------------------------------------------------------------------

class Command(BaseCommand):
    help = (
        "DEVELOPMENT ONLY — seed the database with realistic Course and Lesson data. "
        "Never run this in production."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--courses",
            type=int,
            default=10,
            metavar="N",
            help="Number of courses to create (default: 10).",
        )
        parser.add_argument(
            "--lessons",
            type=int,
            default=5,
            metavar="N",
            help="Average lessons per course (default: 5; actual count varies ±2).",
        )
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Delete ALL existing courses (and their lessons via CASCADE) before seeding.",
        )

    # ------------------------------------------------------------------
    def handle(self, *args, **options):
        n_courses = options["courses"]
        avg_lessons = options["lessons"]
        do_clear = options["clear"]

        # ---- safety guard ------------------------------------------------
        from django.conf import settings as dj_settings
        if not dj_settings.DEBUG:
            raise CommandError(
                "seed_courses refused to run: DEBUG is False. "
                "This command is for development only."
            )

        # ---- optional wipe -----------------------------------------------
        if do_clear:
            deleted, _ = Course.objects.all().delete()
            self.stdout.write(self.style.WARNING(f"Deleted {deleted} existing course records."))

        # ---- collect existing slugs so we never collide ------------------
        existing_slugs: set = set(Course.objects.values_list("slug", flat=True))

        # ---- build Course objects ----------------------------------------
        pool = list(COURSE_TEMPLATES)       # copy so we can pop without mutation
        random.shuffle(pool)

        course_objs: list[Course] = []
        for i in range(n_courses):
            template = pool[i % len(pool)]
            lang = random.choice(LANGS)
            course_objs.append(_build_course_obj(template, lang, existing_slugs))

        # bulk_create courses — returns the saved instances with PKs
        created_courses = Course.objects.bulk_create(course_objs)
        self.stdout.write(
            self.style.SUCCESS(f"Created {len(created_courses)} courses.")
        )

        # ---- build Lesson objects ----------------------------------------
        lesson_objs: list[Lesson] = []
        for course in created_courses:
            # Vary lesson count realistically: avg ± 2, minimum 1
            n_lessons = max(1, avg_lessons + random.randint(-2, 2))
            lesson_objs.extend(_build_lesson_objs(course, n_lessons))

        # NOTE: bulk_create bypasses Lesson.save(), so youtube_video_id is
        # pre-filled above in _build_lesson_objs() to avoid that limitation.
        Lesson.objects.bulk_create(lesson_objs)
        self.stdout.write(
            self.style.SUCCESS(f"Created {len(lesson_objs)} lessons across {len(created_courses)} courses.")
        )

        # ---- summary -----------------------------------------------------
        self.stdout.write(
            self.style.HTTP_INFO(
                f"\nDone. DB now has {Course.objects.count()} courses "
                f"and {Lesson.objects.count()} lessons total."
            )
        )
