from sqlalchemy import Column, String, DateTime, Integer, Text, Float, ForeignKey, Boolean
from sqlalchemy import JSON, UUID
from datetime import datetime, timezone
import uuid
from app.models.base import Base

class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id"), nullable=False, index=True)
    role = Column(String, nullable=False) # 'user', 'assistant', 'system'
    content = Column(Text, nullable=False)
    language = Column(String, default="en")
    retrieved_sources = Column(JSON, nullable=True)
    response_time_ms = Column(Integer, nullable=True)
    tokens_used = Column(Integer, nullable=True)
    cost = Column(Float, nullable=True)
    feedback_score = Column(Integer, nullable=True)
    feedback_comment = Column(Text, nullable=True)
    model_name = Column(String, nullable=True)
    is_streamed = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
