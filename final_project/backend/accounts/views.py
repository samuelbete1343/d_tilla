"""
accounts/views.py

FIX 1 — CSRF safety documented explicitly.
  This file uses @api_view with JWTAuthentication only (configured in settings.py
  DEFAULT_AUTHENTICATION_CLASSES). DRF skips CSRF enforcement when no
  SessionAuthentication class is present, so AllowAny endpoints are safe.
  See settings.py FIX 1 comment for the full explanation and future-dev warning.

FIX #4 — authenticate() passes email as `username`.
  Django's ModelBackend looks up users by USERNAME_FIELD, which is "email"
  on our custom User model. AUTHENTICATION_BACKENDS is set explicitly in
  settings.py to guarantee this always routes correctly.

Response shape:
  CustomJSONRenderer wraps every response: { success, message, data, error }.
  Login/register return { access, refresh, user } which lands in data.
  Frontend reads body.data.access, body.data.refresh, body.data.user.
"""

import logging
from django.contrib.auth import get_user_model, authenticate
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import RegisterSerializer, UserSerializer

logger = logging.getLogger(__name__)
User = get_user_model()


# ---------------------------------------------------------------------------
# Throttle helpers
# ---------------------------------------------------------------------------

class LoginThrottle(AnonRateThrottle):
    scope = "login"   # maps to DEFAULT_THROTTLE_RATES["login"] = "10/min"


class RegisterThrottle(AnonRateThrottle):
    rate = "5/min"


# ---------------------------------------------------------------------------
# Helper: build token pair + user payload
# ---------------------------------------------------------------------------

def _token_response(user: User) -> dict:
    """Return access token, refresh token, and serialized user."""
    refresh = RefreshToken.for_user(user)
    return {
        "access":  str(refresh.access_token),
        "refresh": str(refresh),
        "user":    UserSerializer(user).data,
    }


# ---------------------------------------------------------------------------
# Auth endpoints
# ---------------------------------------------------------------------------

@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([RegisterThrottle])
def register(request):
    """POST /api/auth/register/"""
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {"error": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = serializer.save()
    logger.info("New user registered: %s", user.email)
    return Response(_token_response(user), status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([LoginThrottle])
def login(request):
    """POST /api/auth/login/"""
    email    = request.data.get("email", "").strip().lower()
    password = request.data.get("password", "")

    if not email or not password:
        return Response(
            {"detail": "Email and password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # FIX #4 — username= maps to USERNAME_FIELD ("email") in ModelBackend
    user = authenticate(request, username=email, password=password)

    if user is None:
        # Generic message prevents user enumeration
        return Response(
            {"detail": "Invalid email or password."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if not user.is_active:
        return Response(
            {"detail": "Account is inactive. Contact support on Telegram."},
            status=status.HTTP_403_FORBIDDEN,
        )

    logger.info("User logged in: %s", user.email)
    return Response(_token_response(user), status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    """POST /api/auth/logout/ — blacklists the refresh token."""
    refresh_token = request.data.get("refresh")
    if refresh_token:
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            pass  # Already blacklisted or invalid — still succeed
    return Response({"detail": "Logged out successfully."}, status=status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# Profile endpoint
# ---------------------------------------------------------------------------

@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def profile(request):
    """GET/PATCH /api/auth/profile/"""
    if request.method == "GET":
        return Response(UserSerializer(request.user).data)

    serializer = UserSerializer(request.user, data=request.data, partial=True)
    if not serializer.is_valid():
        return Response(
            {"error": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )

    serializer.save()
    return Response(serializer.data)
