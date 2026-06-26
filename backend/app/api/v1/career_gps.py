from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.roadmap_service import roadmap_service
from app.services.career_gps_service import career_gps_service
from app.realtime.websocket_manager import manager, EventType
from app.schemas.base import APIResponse
from pydantic import BaseModel
from typing import Optional, List
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

class GenerateRoadmapRequest(BaseModel):
    student_id: str
    career_id: str | None = None
    existing_skills: list[str] | None = None

@router.post("/generate", response_model=APIResponse)
async def generate_roadmap(request: GenerateRoadmapRequest, db: AsyncSession = Depends(get_db)):
    try:
        logger.info(f"Generating roadmap for student: {request.student_id}")
        roadmap = await roadmap_service.generate_and_save_roadmap(
            db, request.student_id, request.career_id
        )
        if not roadmap:
            raise HTTPException(status_code=400, detail="Failed to generate roadmap. Verify student profile exists.")
        
        # Serialize roadmap steps and milestones for response
        steps = []
        for step in (roadmap.steps or []):
            steps.append({
                "id": step.id,
                "title": step.title,
                "description": step.description,
                "status": step.status,
                "completion": 100 if step.status == "completed" else 50 if step.status == "in_progress" else 0,
                "estimated_days": int(step.estimated_hours / 2) if step.estimated_hours else 14,
                "month": f"Month {step.step_order}",
                "resources": step.resource_links or []
            })

        milestones = []
        for ms in (roadmap.milestones or []):
            milestones.append({
                "title": ms.title,
                "completed": ms.completed,
                "completed_at": ms.target_date.strftime("%Y-%m-%d") if (ms.completed and ms.target_date) else None
            })

        data = {
            "roadmap_id": roadmap.id,
            "title": roadmap.title,
            "completion_percentage": roadmap.completion_percentage,
            "steps": steps,
            "milestones": milestones
        }
        
        return APIResponse(success=True, message="Roadmap generated successfully", data=data)
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error in generate_roadmap: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/roadmap", response_model=APIResponse)
async def get_roadmap(student_id: str, db: AsyncSession = Depends(get_db)):
    try:
        roadmap = await roadmap_service.get_active_roadmap(db, student_id)
        if not roadmap:
            return APIResponse(success=True, message="No active roadmap found", data=[])
            
        steps = []
        for step in sorted(roadmap.steps or [], key=lambda x: x.step_order):
            steps.append({
                "id": step.id,
                "title": step.title,
                "description": step.description,
                "status": step.status,
                "completion": 100 if step.status == "completed" else 50 if step.status == "in_progress" else 0,
                "estimated_days": int(step.estimated_hours / 2) if step.estimated_hours else 14,
                "month": f"Month {step.step_order}",
                "resources": step.resource_links or []
            })
            
        return APIResponse(success=True, message="Roadmap fetched successfully", data=steps)
    except Exception as e:
        logger.error(f"Error in get_roadmap: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/roadmap/step/{step_id}", response_model=APIResponse)
async def update_roadmap_step(step_id: str, student_id: str, db: AsyncSession = Depends(get_db)):
    try:
        updated = await roadmap_service.toggle_step_completion(db, step_id, student_id)
        if not updated:
            raise HTTPException(status_code=404, detail="Roadmap step not found")
        return APIResponse(
            success=True, 
            message=f"Step status updated to {updated.status}", 
            data={"id": updated.id, "status": updated.status}
        )
    except Exception as e:
        logger.error(f"Error in update_roadmap_step: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/skill-gaps", response_model=APIResponse)
async def get_skill_gaps(student_id: str, career_id: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    try:
        gaps = await career_gps_service.get_skill_gaps(db, student_id, career_id)
        return APIResponse(success=True, message="Skill gaps fetched successfully", data=gaps)
    except Exception as e:
        logger.error(f"Error in get_skill_gaps: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recommendations", response_model=APIResponse)
async def get_recommendations(student_id: str, db: AsyncSession = Depends(get_db)):
    try:
        recs = await career_gps_service.get_recommendations(db, student_id)
        return APIResponse(success=True, message="Recommendations fetched successfully", data=recs)
    except Exception as e:
        logger.error(f"Error in get_recommendations: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/milestones", response_model=APIResponse)
async def get_milestones(student_id: str, db: AsyncSession = Depends(get_db)):
    try:
        milestones = await career_gps_service.get_milestones(db, student_id)
        return APIResponse(success=True, message="Milestones fetched successfully", data=milestones)
    except Exception as e:
        logger.error(f"Error in get_milestones: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/progress", response_model=APIResponse)
async def get_progress(student_id: str, db: AsyncSession = Depends(get_db)):
    try:
        metrics = await career_gps_service.get_progress_metrics(db, student_id)
        return APIResponse(success=True, message="Progress metrics fetched successfully", data=metrics)
    except Exception as e:
        logger.error(f"Error in get_progress: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/career-summary", response_model=APIResponse)
async def get_career_summary(student_id: str, db: AsyncSession = Depends(get_db)):
    try:
        summary = await career_gps_service.get_career_summary(db, student_id)
        return APIResponse(success=True, message="Career summary fetched successfully", data=summary)
    except Exception as e:
        logger.error(f"Error in get_career_summary: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/graph", response_model=APIResponse)
async def get_graph(student_id: str, db: AsyncSession = Depends(get_db)):
    try:
        graph = await career_gps_service.get_interactive_graph(db, student_id)
        return APIResponse(success=True, message="Interactive graph fetched successfully", data=graph)
    except Exception as e:
        logger.error(f"Error in get_graph: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# WebSocket route for real-time updates
@router.websocket("/ws/career-gps/{student_id}")
async def career_gps_websocket_endpoint(websocket: WebSocket, student_id: str):
    logger.info(f"WebSocket client connected to Career GPS: {student_id}")
    await manager.connect(websocket, user_id=student_id)
    try:
        while True:
            # Maintain connection and listen for heartbeat/messages if any
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        logger.info(f"WebSocket client disconnected from Career GPS: {student_id}")
        manager.disconnect(websocket, user_id=student_id)
    except Exception as e:
        logger.error(f"Error in Career GPS WebSocket for {student_id}: {e}")
        manager.disconnect(websocket, user_id=student_id)
