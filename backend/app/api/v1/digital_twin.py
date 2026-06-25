from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.api import deps
from app.models.user import User
from app.repositories import digital_twin_repository, profile_repository
from app.services import digital_twin_service
from app.schemas.digital_twin import DigitalTwinResponse
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/me", response_model=dict)
async def get_my_digital_twin(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    student = await profile_repository.get_student_profile(db, str(current_user.id))
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    twin = await digital_twin_repository.get_digital_twin(db, str(student.id))

    # Auto-generate if twin doesn't exist yet and onboarding is complete
    if not twin and student.is_onboarding_completed:
        logger.info(f"[DigitalTwin] Auto-generating twin for student {student.id}")
        try:
            twin = await digital_twin_service.generate_digital_twin(db, str(student.id))
        except Exception as e:
            logger.error(f"[DigitalTwin] Auto-generation failed: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to generate Digital Twin: {str(e)}")

    if not twin:
        return {
            "success": True,
            "message": "Twin not generated yet. Complete onboarding first.",
            "data": None,
        }

    return {
        "success": True,
        "message": "Digital Twin fetched successfully",
        "data": DigitalTwinResponse.model_validate(twin).model_dump(),
    }


@router.put("/recalculate", response_model=dict)
async def recalculate_twin(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    student = await profile_repository.get_student_profile(db, str(current_user.id))
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    try:
        twin = await digital_twin_service.generate_digital_twin(db, str(student.id))
    except Exception as e:
        logger.error(f"[DigitalTwin] Recalculate failed for student {student.id}: {e}")
        raise HTTPException(status_code=500, detail=f"Recalculation failed: {str(e)}")

    return {
        "success": True,
        "message": "Digital Twin recalculated successfully",
        "data": DigitalTwinResponse.model_validate(twin).model_dump(),
    }


@router.get("/history", response_model=dict)
async def get_twin_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Return the last 10 historical score snapshots for trend charts."""
    student = await profile_repository.get_student_profile(db, str(current_user.id))
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    history = await digital_twin_repository.get_twin_history(db, str(student.id), limit=10)

    # Return oldest-first for chart rendering
    history_data = [
        {
            "academic_score": h.academic_score,
            "career_readiness": h.career_readiness,
            "financial_stability": h.financial_stability,
            "confidence_score": h.confidence_score,
            "success_score": h.success_score,
            "risk_score": h.risk_score,
            "created_at": h.created_at.isoformat() if h.created_at else None,
        }
        for h in reversed(history)
    ]

    return {
        "success": True,
        "message": "History fetched",
        "data": history_data,
    }
