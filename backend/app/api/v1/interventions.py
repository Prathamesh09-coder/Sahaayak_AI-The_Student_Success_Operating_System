from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.intervention_service import intervention_service
from app.schemas.base import APIResponse
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/me", response_model=APIResponse)
async def get_my_interventions(student_id: str, db: AsyncSession = Depends(get_db)):
    try:
        res = await intervention_service.get_student_interventions(db, student_id)
        return APIResponse(success=True, message="Active interventions fetched successfully", data=res)
    except Exception as e:
        logger.error(f"Error in get_my_interventions: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=APIResponse)
async def get_interventions(student_id: str, db: AsyncSession = Depends(get_db)):
    # Aliased for backward compatibility
    try:
        res = await intervention_service.get_student_interventions(db, student_id)
        return APIResponse(success=True, message="Active interventions fetched successfully", data=res)
    except Exception as e:
        logger.error(f"Error in get_interventions: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/active", response_model=APIResponse)
async def get_active_interventions(student_id: str, db: AsyncSession = Depends(get_db)):
    # Aliased for backward compatibility
    try:
        res = await intervention_service.get_student_interventions(db, student_id)
        return APIResponse(success=True, message="Active interventions fetched successfully", data=res)
    except Exception as e:
        logger.error(f"Error in get_active_interventions: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
