"""
core/renderers.py

Wraps every DRF response in:
  { success: bool, message: str, data: any, error: any }

FIX #1 — set-subtraction crash fixed.
  Old code: `'data' in data - {'message'}` — Python set subtraction on a dict
  raises TypeError. Fixed by using clear if/else branches.

FIX #2 — renderer registered in DEFAULT_RENDERER_CLASSES in settings.py.
"""

from rest_framework.renderers import JSONRenderer


class CustomJSONRenderer(JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None):
        status_code = (
            renderer_context["response"].status_code
            if renderer_context
            else 200
        )

        is_success = status_code < 400

        if isinstance(data, dict):
            message = data.get("message") or ("Success" if is_success else "Error")
        else:
            message = "Success" if is_success else "Error"

        if is_success:
            if isinstance(data, dict):
                payload = {k: v for k, v in data.items() if k != "message"} or None
            else:
                payload = data
            error = None
        else:
            payload = None
            if isinstance(data, dict) and "error" in data:
                error = data["error"]
            else:
                error = data

        envelope = {
            "success": is_success,
            "message": message,
            "data":    payload,
            "error":   error,
        }

        return super().render(envelope, accepted_media_type, renderer_context)
