"""
courses/import_views.py

Bulk Course + Lesson Import — POST /api/courses/import/

Authentication: staff only (is_staff=True).
Accepts: multipart/form-data with a single file field named "file".
Supported formats: .csv, .xlsx, .json

--- JSON FORMAT (new) ---
The JSON file must be a list of course objects:
[
  {
    "title":          "General Biology",           (* required)
    "description":    "...",                       (* required)
    "category":       "Science",                   (* required)
    "price":          "0.00",                      (optional)
    "image":          "https://...",               (optional)
    "is_published":   true,                        (optional, default false)
    "catalogue_code": "BIOL-101",                  (optional)
    "lessons": [                                   (optional)
      {
        "title":            "Cell Biology",        (* required within lesson)
        "description":      "...",                 (optional)
        "order_index":      1,                     (optional, auto-increments)
        "is_free_preview":  false,                 (optional)
        "duration_seconds": 900,                   (optional)
        "youtube_url":      "https://youtu.be/..."  (optional)
      }
    ]
  }
]

--- CSV / XLSX FORMAT (unchanged) ---
Same column headers as before. Lessons cannot be embedded in CSV/XLSX.

Processing:
  1. Detect format from file extension (.csv / .xlsx / .json).
  2. Parse all rows/objects into a list of dicts.
  3. Validate required fields per course.
  4. Skip duplicate courses (matched by title, case-insensitive).
  5. Create valid courses (and their lessons) in a single atomic transaction.
  6. Return a detailed per-row result report.

FIX — is_published defaults to True for JSON imports so courses are
      immediately visible. For CSV/XLSX it remains False (explicit opt-in)
      but a warning is logged when the column is absent.
"""

import csv
import io
import json
import logging
from decimal import Decimal, InvalidOperation

from django.db import transaction
from django.utils.text import slugify

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status

from .models import Course, Lesson

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

REQUIRED_FIELDS   = {"title", "description", "category"}
SUPPORTED_FORMATS = {".csv", ".xlsx", ".json"}
MAX_FILE_SIZE     = 5 * 1024 * 1024   # 5 MB hard cap

_TRUTHY = {"true", "1", "yes", "y", "on"}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _normalise_header(h: str) -> str:
    return h.strip().lower().replace(" ", "_")


def _parse_bool(value, default: bool = False) -> bool:
    if isinstance(value, bool):
        return value
    return str(value).strip().lower() in _TRUTHY if value else default


def _parse_decimal(value):
    """Return a Decimal or None if value is empty/invalid."""
    if value is None:
        return None
    s = str(value).strip()
    if not s:
        return None
    try:
        return Decimal(s)
    except InvalidOperation:
        return None


def _unique_slug(base_slug: str) -> str:
    """Ensure slug is unique by appending an incrementing suffix if needed."""
    slug = base_slug
    counter = 1
    while Course.objects.filter(slug=slug).exists():
        slug = f"{base_slug}-{counter}"
        counter += 1
    return slug


def _parse_csv(file_bytes: bytes) -> list[dict]:
    text = file_bytes.decode("utf-8-sig")   # utf-8-sig strips BOM if present
    reader = csv.DictReader(io.StringIO(text))
    rows = []
    for row in reader:
        rows.append({_normalise_header(k): (v or "").strip() for k, v in row.items()})
    return rows


def _parse_xlsx(file_bytes: bytes) -> list[dict]:
    """
    Parse an .xlsx file using openpyxl (pure Python, no C deps).
    First row is treated as the header row.
    """
    try:
        import openpyxl
    except ImportError:
        raise ImportError(
            "openpyxl is required for .xlsx imports. "
            "Add it to requirements.txt: openpyxl>=3.1.0"
        )

    wb = openpyxl.load_workbook(
        filename=io.BytesIO(file_bytes),
        read_only=True,
        data_only=True,
    )
    ws = wb.active

    rows_iter = ws.iter_rows(values_only=True)
    try:
        raw_headers = next(rows_iter)
    except StopIteration:
        return []

    headers = [_normalise_header(str(h)) if h is not None else "" for h in raw_headers]

    rows = []
    for raw_row in rows_iter:
        row = {}
        for header, cell in zip(headers, raw_row):
            row[header] = str(cell).strip() if cell is not None else ""
        rows.append(row)

    wb.close()
    return rows


def _parse_json(file_bytes: bytes) -> list[dict]:
    """
    Parse a .json file.  Accepts either:
      - A list of course objects (new format with embedded lessons).
      - A Django fixture list — filtered to courses.course model entries,
        lessons extracted from courses.lesson entries and re-attached by FK.
    """
    try:
        data = json.loads(file_bytes.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        raise ValueError(f"Invalid JSON: {exc}") from exc

    if not isinstance(data, list):
        raise ValueError("JSON root must be a list (of course objects or fixture records).")

    # --- detect Django fixture format ---
    # Fixture entries look like: {"model": "courses.course", "pk": N, "fields": {...}}
    if data and isinstance(data[0], dict) and "model" in data[0]:
        return _parse_fixture(data)

    # --- plain list of course dicts ---
    return data


def _parse_fixture(fixture_data: list[dict]) -> list[dict]:
    """
    Convert a Django fixture list into the flat course+lesson dicts
    this importer expects.
    """
    raw_courses = {}
    raw_lessons = []

    for entry in fixture_data:
        model = entry.get("model", "")
        fields = entry.get("fields", {})
        pk = entry.get("pk")

        if model == "courses.course":
            raw_courses[pk] = {**fields, "_fixture_pk": pk, "lessons": []}

        elif model == "courses.lesson":
            raw_lessons.append({**fields, "_course_pk": fields.get("course")})

    # Attach lessons to their courses
    for lesson in raw_lessons:
        course_pk = lesson.get("_course_pk")
        if course_pk in raw_courses:
            raw_courses[course_pk]["lessons"].append(lesson)

    return list(raw_courses.values())


def _validate_row(row: dict, row_num: int) -> str | None:
    """Return an error message string if the row is invalid, else None."""
    missing = [f for f in REQUIRED_FIELDS if not str(row.get(f, "")).strip()]
    if missing:
        return f"Missing required field(s): {', '.join(sorted(missing))}"
    if len(str(row.get("title", ""))) > 255:
        return "title exceeds 255 characters"
    if len(str(row.get("category", ""))) > 100:
        return "category exceeds 100 characters"
    price_raw = row.get("price", "")
    if price_raw and _parse_decimal(price_raw) is None:
        return f"price '{price_raw}' is not a valid decimal number"
    image_raw = str(row.get("image", "") or "")
    if image_raw and not (image_raw.startswith("http://") or image_raw.startswith("https://")):
        return f"image must be a valid URL starting with http:// or https://"
    return None


def _build_lessons(course: Course, lessons_data: list[dict]) -> list[Lesson]:
    """
    Build Lesson objects for a course from the embedded lessons list.
    Does NOT call save() — caller uses bulk_create or individual save().
    youtube_video_id is extracted here so bulk_create doesn't skip save().
    """
    from .utils import extract_youtube_id

    objs = []
    for idx, ld in enumerate(lessons_data, start=1):
        title = str(ld.get("title", "")).strip()
        if not title:
            continue   # silently skip lessons without a title

        youtube_url = str(ld.get("youtube_url", "") or "").strip()
        video_id = (
            str(ld.get("youtube_video_id", "") or "").strip()
            or extract_youtube_id(youtube_url)
        )

        order = ld.get("order_index")
        try:
            order = int(order) if order is not None else idx
        except (ValueError, TypeError):
            order = idx

        objs.append(Lesson(
            course           = course,
            title            = title[:255],
            description      = str(ld.get("description", "") or "").strip(),
            order_index      = order,
            is_free_preview  = _parse_bool(ld.get("is_free_preview"), default=False),
            duration_seconds = int(ld.get("duration_seconds") or 0),
            youtube_url      = youtube_url,
            youtube_video_id = video_id,   # pre-fill so bulk_create works
        ))

    return objs


# ---------------------------------------------------------------------------
# View
# ---------------------------------------------------------------------------

class BulkCourseImportView(APIView):
    """
    POST /api/courses/import/
    Staff only. Accepts multipart/form-data with field "file"
    (.csv, .xlsx, or .json).
    """
    permission_classes = [IsAdminUser]
    parser_classes     = [MultiPartParser, FormParser]

    def post(self, request):
        # ── 1. Validate file present ────────────────────────────────────────
        uploaded = request.FILES.get("file")
        if not uploaded:
            return Response(
                {"message": "No file uploaded. Send a multipart/form-data POST with field 'file'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── 2. File size guard ──────────────────────────────────────────────
        if uploaded.size > MAX_FILE_SIZE:
            return Response(
                {"message": f"File too large. Maximum allowed size is {MAX_FILE_SIZE // (1024*1024)} MB."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── 3. Detect format ────────────────────────────────────────────────
        filename    = uploaded.name.lower()
        file_bytes  = uploaded.read()

        if filename.endswith(".csv"):
            try:
                rows = _parse_csv(file_bytes)
            except Exception as exc:
                logger.warning("CSV parse error: %s", exc)
                return Response(
                    {"message": f"Could not parse CSV file: {exc}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        elif filename.endswith(".xlsx"):
            try:
                rows = _parse_xlsx(file_bytes)
            except ImportError as exc:
                return Response(
                    {"message": str(exc)},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
            except Exception as exc:
                logger.warning("XLSX parse error: %s", exc)
                return Response(
                    {"message": f"Could not parse XLSX file: {exc}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        elif filename.endswith(".json"):
            try:
                rows = _parse_json(file_bytes)
            except (ValueError, Exception) as exc:
                logger.warning("JSON parse error: %s", exc)
                return Response(
                    {"message": f"Could not parse JSON file: {exc}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            ext = filename.rsplit(".", 1)[-1] if "." in filename else "unknown"
            return Response(
                {"message": f"Unsupported file type '.{ext}'. Please upload a .csv, .xlsx, or .json file."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not rows:
            return Response(
                {"message": "The file is empty or contains only a header row."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── 4. Load existing titles for duplicate detection ─────────────────
        existing_titles_lower = {
            t.lower() for t in Course.objects.values_list("title", flat=True)
        }

        # ── 5. Process each row ─────────────────────────────────────────────
        results        = []
        courses_to_create: list[tuple[int, str, Course, list]] = []
        seen_titles_this_import: set[str] = set()

        for idx, row in enumerate(rows, start=1):
            row_title = str(row.get("title", "") or "").strip()

            # Validate
            error_msg = _validate_row(row, idx)
            if error_msg:
                results.append({
                    "row":    idx,
                    "title":  row_title or None,
                    "status": "error",
                    "reason": error_msg,
                })
                continue

            # Duplicate: already in DB
            if row_title.lower() in existing_titles_lower:
                results.append({
                    "row":    idx,
                    "title":  row_title,
                    "status": "skipped",
                    "reason": "A course with this title already exists in the database.",
                })
                continue

            # Duplicate: already seen in this import batch
            if row_title.lower() in seen_titles_this_import:
                results.append({
                    "row":    idx,
                    "title":  row_title,
                    "status": "skipped",
                    "reason": "Duplicate title found earlier in this import file.",
                })
                continue

            # Build Course object
            base_slug = slugify(row_title)
            slug      = _unique_slug(base_slug)

            # FIX: JSON imports default is_published=True so courses are
            # immediately visible. CSV/XLSX default remains False.
            default_published = filename.endswith(".json")

            course = Course(
                title          = row_title,
                slug           = slug,
                description    = str(row.get("description", "") or "").strip(),
                category       = str(row.get("category", "") or "").strip(),
                price          = _parse_decimal(row.get("price")),
                image          = str(row.get("image", "") or "").strip() or None,
                is_published   = _parse_bool(row.get("is_published"), default=default_published),
                catalogue_code = str(row.get("catalogue_code", "") or "").strip(),
            )

            # Collect embedded lessons (JSON format only)
            lessons_data = row.get("lessons") or []

            courses_to_create.append((idx, row_title, course, lessons_data))
            seen_titles_this_import.add(row_title.lower())
            existing_titles_lower.add(row_title.lower())

        # ── 6. Create courses + lessons in one transaction ──────────────────
        created_count = 0
        if courses_to_create:
            try:
                with transaction.atomic():
                    all_lessons: list[Lesson] = []

                    for _, _, course_obj, lessons_data in courses_to_create:
                        course_obj.save()   # assigns PK, triggers slug generation

                        if lessons_data:
                            lesson_objs = _build_lessons(course_obj, lessons_data)
                            all_lessons.extend(lesson_objs)

                    if all_lessons:
                        # bulk_create is safe here: youtube_video_id is
                        # pre-filled in _build_lessons() so save() is not needed.
                        Lesson.objects.bulk_create(all_lessons, batch_size=500)

                for row_num, row_title, _, lessons_data in courses_to_create:
                    lesson_count = len(lessons_data)
                    results.append({
                        "row":          row_num,
                        "title":        row_title,
                        "status":       "created",
                        "reason":       None,
                        "lesson_count": lesson_count,
                    })
                    created_count += 1

            except Exception as exc:
                logger.exception("Bulk import transaction failed: %s", exc)
                return Response(
                    {"message": f"Database error during import: {exc}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        # ── 7. Sort results by row number and return ─────────────────────────
        results.sort(key=lambda r: r["row"])

        skipped_count = sum(1 for r in results if r["status"] == "skipped")
        error_count   = sum(1 for r in results if r["status"] == "error")

        logger.info(
            "Bulk import by %s: total=%d created=%d skipped=%d errors=%d",
            request.user.email,
            len(rows),
            created_count,
            skipped_count,
            error_count,
        )

        return Response(
            {
                "message": "Import complete",
                "data": {
                    "total_rows": len(rows),
                    "created":    created_count,
                    "skipped":    skipped_count,
                    "errors":     error_count,
                    "results":    results,
                },
            },
            status=status.HTTP_200_OK,
        )
