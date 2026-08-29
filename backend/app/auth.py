"""
JWT verification using Supabase's JWKS endpoint.
New Supabase projects sign JWTs with ES256 (asymmetric).
Keys are fetched from /auth/v1/.well-known/jwks.json and cached per process.
"""
import httpx
from dataclasses import dataclass
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError, jwk
from sqlalchemy.orm import Session

from app.config import SUPABASE_URL
from app.database import get_db
from app.models import Profile

security = HTTPBearer()

# ── JWKS cache (fetched once per process) ─────────────────────────────────────
_jwks_cache: dict | None = None


def _get_jwks() -> dict:
    global _jwks_cache
    if _jwks_cache is None:
        url = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"
        try:
            resp = httpx.get(url, timeout=10)
            resp.raise_for_status()
            _jwks_cache = resp.json()
            print(f"[AUTH] Loaded {len(_jwks_cache.get('keys', []))} key(s) from Supabase JWKS")
        except Exception as e:
            raise RuntimeError(f"Failed to fetch Supabase JWKS from {url}: {e}")
    return _jwks_cache


def _decode_supabase_token(token: str) -> dict:
    """Decode and verify a Supabase JWT using JWKS (ES256 or HS256)."""
    jwks = _get_jwks()
    keys = jwks.get("keys", [])

    # Get the algorithm and kid from the token header
    try:
        header = jwt.get_unverified_header(token)
    except JWTError as e:
        raise JWTError(f"Could not read token header: {e}")

    alg = header.get("alg", "ES256")
    kid = header.get("kid")

    # Find the matching key by kid, fall back to first key
    matching_key = next((k for k in keys if k.get("kid") == kid), None)
    if matching_key is None:
        if keys:
            matching_key = keys[0]
            alg = matching_key.get("alg", alg)
        else:
            raise JWTError("No keys found in Supabase JWKS")

    public_key = jwk.construct(matching_key, algorithm=alg)

    payload = jwt.decode(
        token,
        public_key,
        algorithms=[alg],
        options={"verify_aud": False},
    )
    return payload


# ── CurrentUser dataclass ─────────────────────────────────────────────────────

@dataclass
class CurrentUser:
    user_id: str
    group_number: int
    email: str


# ── Dependencies ──────────────────────────────────────────────────────────────

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> CurrentUser:
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = _decode_supabase_token(token)
        user_id: str = payload.get("sub")
        if not user_id:
            raise credentials_exception
    except JWTError as e:
        print(f"[AUTH DEBUG] JWTError in get_current_user: {e}")
        raise credentials_exception

    # Fetch profile (contains group_number)
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Profile not set up. Please complete onboarding.",
        )

    return CurrentUser(
        user_id=user_id,
        group_number=profile.group_number,
        email=profile.email,
    )


def get_current_user_no_profile(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> tuple:
    """
    Verifies the JWT but does NOT require a profile to exist.
    Used only for the profile creation endpoint (POST /api/profile).
    Returns (user_id, email).
    """
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = _decode_supabase_token(token)
        user_id: str = payload.get("sub")
        email: str = payload.get("email", "")
        if not user_id:
            raise credentials_exception
        return user_id, email
    except JWTError as e:
        print(f"[AUTH DEBUG] JWTError in get_current_user_no_profile: {e}")
        raise credentials_exception
