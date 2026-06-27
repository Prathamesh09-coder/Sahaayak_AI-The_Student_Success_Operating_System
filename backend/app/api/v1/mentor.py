import logging
import traceback
import asyncio
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.mentor_service import handle_chat_message
from app.repositories import conversation_repository

logger = logging.getLogger(__name__)

router = APIRouter()

@router.websocket("/ws/{conversation_id}")
async def mentor_websocket_endpoint(
    websocket: WebSocket,
    conversation_id: str,
    db: AsyncSession = Depends(get_db)
):
    from app.realtime.websocket_manager import manager
    
    student_id = websocket.query_params.get("student_id")
    if not student_id:
        logger.error("WebSocket connection rejected: student_id is required")
        await websocket.accept()
        await websocket.send_json({
            "type": "chat.error",
            "error": "student_id required",
            "event": "chat.error",
            "message": "student_id required"
        })
        await websocket.close()
        return

    # Validate conversation existence if not a new one
    if not conversation_id.startswith("new_"):
        conversation = await conversation_repository.get_conversation(db, conversation_id)
        if not conversation:
            logger.error(f"WebSocket connection rejected: Conversation {conversation_id} not found")
            await websocket.accept()
            await websocket.send_json({
                "type": "chat.error",
                "error": "Conversation not found",
                "event": "chat.error",
                "message": "Conversation not found"
            })
            await websocket.close()
            return

    await manager.connect(websocket, user_id=student_id)
    
    # Start heartbeat background task
    async def send_heartbeats():
        try:
            while True:
                await asyncio.sleep(5)
                await websocket.send_json({"event": "heartbeat"})
        except asyncio.CancelledError:
            pass
        except Exception as e:
            logger.debug(f"Heartbeat task exception: {e}")

    heartbeat_task = asyncio.create_task(send_heartbeats())

    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            
            if payload.get("event") == "chat.message":
                user_message = payload.get("message", "")
                language = payload.get("language", "en")
                if user_message:
                    # If this is a new conversation, create it in PostgreSQL first
                    if conversation_id.startswith("new_"):
                        title = user_message[:30] + "..." if len(user_message) > 30 else user_message
                        try:
                            conversation = await conversation_repository.create_conversation(db, student_id, title)
                            conversation_id = str(conversation.id)
                            await websocket.send_json({
                                "type": "chat.conversation_created",
                                "conversation_id": conversation_id,
                                "title": conversation.title
                            })
                        except Exception as ce:
                            logger.exception(f"Failed to create conversation in PostgreSQL: {ce}")
                            # fallback to using the original string if DB fails
                            pass

                    # Run handle_chat_message with a 120-second timeout
                    try:
                        await asyncio.wait_for(
                            handle_chat_message(db, student_id, conversation_id, user_message, language),
                            timeout=120.0
                        )
                    except asyncio.TimeoutError:
                        logger.error(f"Mentor pipeline timed out for user {student_id}")
                        await websocket.send_json({
                            "type": "chat.error",
                            "error": "Response timed out.",
                            "event": "chat.error",
                            "message": "Response timed out."
                        })
                    
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id=student_id)
    except Exception as e:
        logger.exception(f"Mentor websocket error: {e}")
        traceback.print_exc()
        try:
            await websocket.send_json({
                "type": "chat.error",
                "error": str(e),
                "event": "chat.error",
                "message": str(e)
            })
        except Exception:
            pass
        manager.disconnect(websocket, user_id=student_id)
    finally:
        heartbeat_task.cancel()
