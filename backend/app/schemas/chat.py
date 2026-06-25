from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID

class ChatRequest(BaseModel):
    conversation_id: Optional[UUID] = None
    message: str
    language: str = "en"

class MessageFeedbackRequest(BaseModel):
    score: int
    comment: Optional[str] = None

class MessageResponse(BaseModel):
    id: UUID
    role: str
    content: str
    language: str
    retrieved_sources: Optional[List[Dict[str, Any]]] = None
    created_at: datetime
    feedback_score: Optional[int] = None
    feedback_comment: Optional[str] = None

    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    id: UUID
    title: str
    summary: Optional[str] = None
    last_message_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True

class ChatResponse(BaseModel):
    conversation_id: UUID
    message: MessageResponse
