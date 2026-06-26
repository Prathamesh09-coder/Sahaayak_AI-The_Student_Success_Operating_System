from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query
from fastapi.responses import PlainTextResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.db.session import get_db
from app.schemas.chat import ChatRequest, ConversationResponse, MessageFeedbackRequest
from app.repositories import conversation_repository, message_repository
from app.realtime.websocket_manager import manager, EventType
from app.schemas.base import APIResponse
import json
import asyncio

router = APIRouter()

@router.get("/conversations", response_model=APIResponse)
async def get_conversations(student_id: str, db: AsyncSession = Depends(get_db)):
    conversations = await conversation_repository.get_student_conversations(db, student_id)
    return APIResponse(success=True, message="Conversations fetched", data=conversations)

@router.get("/search", response_model=APIResponse)
async def search_conversations(q: str = Query(..., min_length=1), student_id: str = Query(...), db: AsyncSession = Depends(get_db)):
    from app.models.conversation import Conversation
    query = select(Conversation).where(
        Conversation.student_id == student_id,
        or_(
            Conversation.title.ilike(f"%{q}%"),
            Conversation.summary.ilike(f"%{q}%")
        )
    ).order_by(Conversation.last_message_at.desc())
    result = await db.execute(query)
    res = result.scalars().all()
    return APIResponse(success=True, message="Search results fetched", data=res)

@router.post("/conversations/{conversation_id}/pin", response_model=APIResponse)
async def pin_conversation(conversation_id: str, db: AsyncSession = Depends(get_db)):
    conv = await conversation_repository.get_conversation(db, conversation_id)
    if not conv:
        raise HTTPException(404, "Not found")
    conv.is_pinned = not conv.is_pinned
    await db.commit()
    return APIResponse(success=True, message="Conversation pin status toggled", data={"status": "success", "is_pinned": conv.is_pinned})

@router.get("/conversations/{conversation_id}/export")
async def export_conversation(conversation_id: str, format: str = "text", db: AsyncSession = Depends(get_db)):
    messages = await message_repository.get_conversation_history(db, conversation_id)
    if not messages:
        raise HTTPException(404, "No messages found")
        
    conv = await conversation_repository.get_conversation(db, conversation_id)
    title = conv.title if conv else "Exported Conversation"
    
    # We support standard Text export and simple Markdown
    output = f"# {title}\n\n"
    for m in messages:
        output += f"**{m.role.capitalize()}**: {m.content}\n\n"
        
    return PlainTextResponse(content=output)

@router.get("/conversations/{conversation_id}", response_model=APIResponse)
async def get_conversation_history(conversation_id: str, db: AsyncSession = Depends(get_db)):
    if conversation_id.startswith("new_"):
        return APIResponse(success=True, message="New conversation history initialized", data=[])
    messages = await message_repository.get_conversation_history(db, conversation_id)
    return APIResponse(success=True, message="Conversation history fetched", data=messages)

@router.delete("/conversations/{conversation_id}", response_model=APIResponse)
async def archive_conversation(conversation_id: str, db: AsyncSession = Depends(get_db)):
    await conversation_repository.archive_conversation(db, conversation_id)
    return APIResponse(success=True, message="Conversation archived", data={"status": "archived"})

@router.post("/messages/{message_id}/feedback", response_model=APIResponse)
async def add_message_feedback(
    message_id: str, 
    feedback: MessageFeedbackRequest,
    db: AsyncSession = Depends(get_db)
):
    msg = await message_repository.get_message(db, message_id)
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    
    msg.feedback_score = feedback.score
    msg.feedback_comment = feedback.comment
    await db.commit()
    return APIResponse(success=True, message="Feedback submitted", data={"status": "success"})
