from fastapi import APIRouter, Depends
from app.models.user import User
from app.api import deps
from app.schemas.user import UserResponse

router = APIRouter()

@router.get("", response_model=dict)
async def read_users(current_user: User = Depends(deps.get_current_user)):
    # Placeholder for getting a list of users (Admin only typically)
    return {
        "success": True,
        "message": "Users fetched successfully",
        "data": []
    }
