from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.success_story_service import success_story_service

router = APIRouter()

@router.get("/")
async def get_stories(db: AsyncSession = Depends(get_db)):
    return []

@router.get("/recommended")
async def get_recommended_stories(student_id: str, db: AsyncSession = Depends(get_db)):
    mock_student = {
        "career_goal": "ML Engineer",
        "is_first_generation": True
    }
    return success_story_service.get_recommended_stories(mock_student)
