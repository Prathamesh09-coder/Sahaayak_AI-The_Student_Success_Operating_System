import logging
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.knowledge_graph_service import knowledge_graph_service
from app.realtime.websocket_manager import manager, EventType
from app.schemas.base import APIResponse

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/me", response_model=APIResponse)
async def get_my_knowledge_graph(student_id: str, db: AsyncSession = Depends(get_db)):
    try:
        res = await knowledge_graph_service.get_student_graph(db, student_id)
        return APIResponse(success=True, message="Knowledge graph fetched successfully", data=res)
    except Exception as e:
        logger.error(f"Error in get_my_knowledge_graph: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate", response_model=APIResponse)
async def generate_my_knowledge_graph(payload: dict, db: AsyncSession = Depends(get_db)):
    try:
        student_id = payload.get("student_id")
        if not student_id:
            raise HTTPException(status_code=400, detail="student_id is required")
        res = await knowledge_graph_service.generate_student_graph(db, student_id)
        
        # Emit an invalidation event via WebSockets
        try:
            await manager.emit_event(
                event=EventType.KNOWLEDGE_GRAPH_UPDATED,
                payload={"student_id": student_id, "updated_at": str(datetime.utcnow())},
                user_id=student_id
            )
        except Exception as ws_err:
            logger.warning(f"Failed to emit WebSocket event for knowledge graph update: {ws_err}")

        return APIResponse(success=True, message="Knowledge graph generated and synced successfully", data=res)
    except Exception as e:
        logger.error(f"Error in generate_my_knowledge_graph: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# WebSocket route for knowledge graph updates
@router.websocket("/ws/knowledge-graph/{student_id}")
async def knowledge_graph_websocket_endpoint(websocket: WebSocket, student_id: str):
    logger.info(f"WebSocket client connected to Knowledge Graph updates: {student_id}")
    await manager.connect(websocket, user_id=student_id)
    try:
        while True:
            # Keep connection alive
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        logger.info(f"WebSocket client disconnected from Knowledge Graph updates: {student_id}")
        manager.disconnect(websocket, user_id=student_id)
    except Exception as e:
        logger.error(f"Error in Knowledge Graph WebSocket for {student_id}: {e}")
        manager.disconnect(websocket, user_id=student_id)
