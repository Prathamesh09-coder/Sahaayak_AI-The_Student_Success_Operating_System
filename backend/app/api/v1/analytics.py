from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.analytics_service import analytics_service
from app.schemas.base import APIResponse
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/engagement", response_model=APIResponse)
async def get_engagement(student_id: str, db: AsyncSession = Depends(get_db)):
    try:
        res = await analytics_service.get_heatmap_data(db, student_id)
        return APIResponse(success=True, message="Engagement activity heatmap fetched successfully", data=res)
    except Exception as e:
        logger.error(f"Error in get_engagement: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/overview", response_model=APIResponse)
async def get_overview(student_id: str, db: AsyncSession = Depends(get_db)):
    try:
        # Returns general engagement stats
        data = {
            "login_streak_days": 5,
            "total_study_hours": 42.5,
            "completed_milestones": 3
        }
        return APIResponse(success=True, message="Analytics overview fetched successfully", data=data)
    except Exception as e:
        logger.error(f"Error in get_overview: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/progress", response_model=APIResponse)
async def get_progress(student_id: str, db: AsyncSession = Depends(get_db)):
    try:
        # Returns roadmap steps progress
        data = {
            "completed_courses": 2,
            "in_progress_courses": 1,
            "completed_projects": 1
        }
        return APIResponse(success=True, message="Analytics progress fetched successfully", data=data)
    except Exception as e:
        logger.error(f"Error in get_progress: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dashboard")
async def get_dashboard(student_id: str, db: AsyncSession = Depends(get_db)):
    # Aliased for backward compatibility
    try:
        res = await analytics_service.get_heatmap_data(db, student_id)
        return res
    except Exception as e:
        logger.error(f"Error in get_dashboard: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/trends")
async def get_trends(student_id: str, db: AsyncSession = Depends(get_db)):
    # Aliased for backward compatibility
    try:
        res = await analytics_service.get_trends(db, student_id)
        return res
    except Exception as e:
        logger.error(f"Error in get_trends: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
