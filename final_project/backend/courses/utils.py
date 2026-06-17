"""
courses/utils.py

YouTube URL → video ID extractor.
Handles all common YouTube URL formats.
"""
import re
from urllib.parse import urlparse, parse_qs


def extract_youtube_id(url: str) -> str:
    """
    Extract the YouTube video ID from any standard YouTube URL.

    Handles:
      https://www.youtube.com/watch?v=dQw4w9WgXcQ
      https://youtu.be/dQw4w9WgXcQ
      https://www.youtube.com/embed/dQw4w9WgXcQ
      https://youtube.com/shorts/dQw4w9WgXcQ
      dQw4w9WgXcQ  (raw ID passed directly)

    Returns the video ID string, or '' if not parseable.
    """
    if not url:
        return ""

    url = url.strip()

    # Already a raw ID (11 chars, no slashes)
    if re.match(r'^[A-Za-z0-9_-]{11}$', url):
        return url

    try:
        parsed = urlparse(url)
    except Exception:
        return ""

    # youtu.be/<id>
    if parsed.netloc in ("youtu.be", "www.youtu.be"):
        return parsed.path.lstrip("/").split("?")[0]

    # youtube.com/watch?v=<id>
    if "youtube.com" in parsed.netloc:
        qs = parse_qs(parsed.query)
        if "v" in qs:
            return qs["v"][0]

        # youtube.com/embed/<id>  or  /shorts/<id>
        path_parts = parsed.path.strip("/").split("/")
        if len(path_parts) >= 2 and path_parts[0] in ("embed", "shorts", "v"):
            return path_parts[1]

    return ""


def youtube_embed_url(video_id: str) -> str:
    """Return the embed URL for a given YouTube video ID."""
    if not video_id:
        return ""
    return f"https://www.youtube.com/embed/{video_id}?rel=0&modestbranding=1"


def youtube_thumbnail_url(video_id: str) -> str:
    """Return the HQ thumbnail URL (no API key needed)."""
    if not video_id:
        return ""
    return f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg"
