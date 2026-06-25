from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.accessibility_service import accessibility_service
from app.schemas.base import APIResponse

router = APIRouter()

@router.get("/preferences", response_model=APIResponse)
async def get_preferences(student_id: str, db: AsyncSession = Depends(get_db)):
    res = accessibility_service.generate_accessibility_preferences(student_id)
    return APIResponse(success=True, message="Accessibility preferences fetched", data=res)

@router.put("/preferences", response_model=APIResponse)
async def update_preferences(student_id: str, prefs: dict, db: AsyncSession = Depends(get_db)):
    return APIResponse(success=True, message="Accessibility preferences updated", data={"status": "updated", "preferences": prefs})
