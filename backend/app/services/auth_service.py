from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.user import UserCreate, UserLogin, Token
from app.models.user import User, RefreshToken
from app.models.student_profile import StudentProfile
from app.repositories import user_repository
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, verify_token
from app.core.exceptions import ValidationException, AuthenticationException
from datetime import datetime, timezone, timedelta
import logging

logger = logging.getLogger(__name__)


async def signup(db: AsyncSession, user_in: UserCreate) -> dict:
    """
    Register a new user, create their StudentProfile stub, and return JWT tokens.
    The caller receives tokens immediately so the frontend can auto-login.
    """
    existing_user = await user_repository.get_user_by_email(db, user_in.email)
    if existing_user:
        raise ValidationException("User with this email already exists.")

    new_user = User(
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name,
        role="STUDENT",
    )
    user = await user_repository.create_user(db, new_user)

    # Auto-create a blank StudentProfile so every downstream service
    # can safely assume student_profile exists after signup.
    student_profile = StudentProfile(
        user_id=str(user.id),
        is_onboarding_completed=False,
        current_step=1,
        profile_completeness=0.0,
    )
    db.add(student_profile)
    await db.commit()
    await db.refresh(student_profile)
    logger.info(f"[Auth] Created StudentProfile {student_profile.id} for user {user.id}")

    # Issue tokens immediately — no need to redirect to /sign-in
    access_token = create_access_token(subject=user.id)
    refresh_token_str = create_refresh_token(subject=user.id)

    db_token = RefreshToken(
        user_id=str(user.id),
        token=refresh_token_str,
        expires_at=datetime.now(timezone.utc) + timedelta(days=7),
    )
    await user_repository.store_refresh_token(db, db_token)

    return {
        "user": {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
        },
        "access_token": access_token,
        "refresh_token": refresh_token_str,
        "student_profile_id": str(student_profile.id),
    }


async def login(db: AsyncSession, user_in: UserLogin) -> Token:
    user = await user_repository.get_user_by_email(db, user_in.email)
    if not user:
        raise AuthenticationException("Incorrect email or password")

    if not verify_password(user_in.password, user.hashed_password):
        raise AuthenticationException("Incorrect email or password")

    if not user.is_active:
        raise AuthenticationException("Inactive user")

    access_token = create_access_token(subject=user.id)
    refresh_token_str = create_refresh_token(subject=user.id)

    db_token = RefreshToken(
        user_id=str(user.id),
        token=refresh_token_str,
        expires_at=datetime.now(timezone.utc) + timedelta(days=7),
    )
    await user_repository.store_refresh_token(db, db_token)

    return Token(access_token=access_token, refresh_token=refresh_token_str)


async def refresh(db: AsyncSession, refresh_token: str) -> Token:
    payload = verify_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise AuthenticationException("Invalid refresh token")

    db_token = await user_repository.get_refresh_token(db, refresh_token)
    if not db_token or db_token.revoked or db_token.expires_at < datetime.now(timezone.utc):
        raise AuthenticationException("Refresh token revoked or expired")

    user_id = payload.get("sub")
    access_token = create_access_token(subject=user_id)

    return Token(access_token=access_token, refresh_token=refresh_token)
