from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.services.success_index_service import success_index_service
from app.services.explainability_service import explainability_service
from app.models.success_index_history import SuccessIndexHistory
from app.services.roadmap_service import resolve_student
from app.realtime.websocket_manager import manager
from app.schemas.base import APIResponse
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/me", response_model=APIResponse)
async def get_my_success_index(student_id: str, db: AsyncSession = Depends(get_db)):
    try:
        res = await success_index_service.get_or_calculate_index(db, student_id)
        return APIResponse(success=True, message="Success index fetched successfully", data=res)
    except Exception as e:
        logger.error(f"Error in get_my_success_index: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history", response_model=APIResponse)
async def get_success_history(student_id: str, db: AsyncSession = Depends(get_db)):
    try:
        profile = await resolve_student(db, student_id)
        if not profile:
            raise HTTPException(status_code=404, detail="Student profile not found")

        # Fetch history entries sorted ascending by date
        result = await db.execute(
            select(SuccessIndexHistory)
            .where(SuccessIndexHistory.student_id == profile.id)
            .order_by(SuccessIndexHistory.created_at.asc())
        )
        history = result.scalars().all()

        data = []
        for entry in history:
            data.append({
                "date": entry.created_at.strftime("%Y-%m-%d") if entry.created_at else "",
                "score": int(entry.overall_score)
            })

        return APIResponse(success=True, message="Success history fetched successfully", data=data)
    except Exception as e:
        logger.error(f"Error in get_success_history: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/trends", response_model=APIResponse)
async def get_trends(student_id: str, db: AsyncSession = Depends(get_db)):
    try:
        from app.services.analytics_service import analytics_service
        res = await analytics_service.get_trends(db, student_id)
        return APIResponse(success=True, message="Success trends fetched successfully", data=res)
    except Exception as e:
        logger.error(f"Error in get_trends: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recommendations", response_model=APIResponse)
async def get_recommendations(student_id: str, db: AsyncSession = Depends(get_db)):
    try:
        res = await explainability_service.generate_improvement_plan(db, student_id)
        return APIResponse(success=True, message="Success recommendations fetched successfully", data=res)
    except Exception as e:
        logger.error(f"Error in get_recommendations: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# WebSocket route for success index updates
@router.websocket("/ws/success/{student_id}")
async def success_websocket_endpoint(websocket: WebSocket, student_id: str):
    logger.info(f"WebSocket client connected to Success Index updates: {student_id}")
    await manager.connect(websocket, user_id=student_id)
    try:
        while True:
            # Keep connection alive
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        logger.info(f"WebSocket client disconnected from Success Index updates: {student_id}")
        manager.disconnect(websocket, user_id=student_id)
    except Exception as e:
        logger.error(f"Error in Success Index WebSocket for {student_id}: {e}")
        manager.disconnect(websocket, user_id=student_id)
