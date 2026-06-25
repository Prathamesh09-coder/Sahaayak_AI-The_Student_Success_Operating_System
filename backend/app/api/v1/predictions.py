from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.predictive_intelligence_service import predictive_intelligence_service
from app.services.forecasting_service import forecasting_service
from app.services.explainability_service import explainability_service
from app.schemas.base import APIResponse
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/me", response_model=APIResponse)
async def get_my_predictions(student_id: str, db: AsyncSession = Depends(get_db)):
    try:
        res = await predictive_intelligence_service.get_student_predictions(db, student_id)
        return APIResponse(success=True, message="Predictive insights fetched successfully", data=res)
    except Exception as e:
        logger.error(f"Error in get_my_predictions: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/forecast", response_model=APIResponse)
async def get_forecast(student_id: str, db: AsyncSession = Depends(get_db)):
    try:
        res = await forecasting_service.get_student_forecast(db, student_id)
        return APIResponse(success=True, message="Success forecast projections fetched successfully", data=res)
    except Exception as e:
        logger.error(f"Error in get_forecast: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/explanations", response_model=APIResponse)
async def get_explanations(student_id: str, db: AsyncSession = Depends(get_db)):
    try:
        res = await explainability_service.get_explanations(db, student_id)
        return APIResponse(success=True, message="Prediction explanations fetched successfully", data=res)
    except Exception as e:
        logger.error(f"Error in get_explanations: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/explanation", response_model=APIResponse)
async def get_explanation(student_id: str, db: AsyncSession = Depends(get_db)):
    # Aliased for backward compatibility
    try:
        res = await explainability_service.get_explanations(db, student_id)
        return APIResponse(success=True, message="Prediction explanations fetched successfully", data=res)
    except Exception as e:
        logger.error(f"Error in get_explanation: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
