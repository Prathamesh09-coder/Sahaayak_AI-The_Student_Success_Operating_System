from fastapi import APIRouter, Depends, Body
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.services import auth_service
from app.api import deps
from app.models.user import User

router = APIRouter()

@router.get("/ping")
async def ping():
    return {"ping": "pong"}



@router.post("/signup")
async def signup(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Register a new account.
    Returns JWT tokens immediately so the client can auto-login.
    Also creates a blank StudentProfile for downstream services.
    """
    result = await auth_service.signup(db, user_in)
    return {
        "success": True,
        "message": "Account created successfully",
        "data": result,
    }


@router.post("/login")
async def login(user_in: UserLogin, db: AsyncSession = Depends(get_db)):
    token = await auth_service.login(db, user_in)
    return {
        "success": True,
        "message": "Login successful",
        "data": token.model_dump(),
    }


@router.get("/me")
async def read_users_me(current_user: User = Depends(deps.get_current_user)):
    user_schema = UserResponse.model_validate(current_user)
    return {
        "success": True,
        "message": "Profile fetched successfully",
        "data": user_schema.model_dump(),
    }


@router.post("/refresh")
async def refresh_token(
    refresh_token: str = Body(..., embed=True),
    db: AsyncSession = Depends(get_db),
):
    token = await auth_service.refresh(db, refresh_token)
    return {
        "success": True,
        "message": "Token refreshed successfully",
        "data": token.model_dump(),
    }
