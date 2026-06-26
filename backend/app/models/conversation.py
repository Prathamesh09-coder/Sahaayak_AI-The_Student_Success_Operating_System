from sqlalchemy import Column, String, DateTime, Boolean, Text, Integer
from sqlalchemy import UUID
from datetime import datetime, timezone
import uuid
from app.models.base import Base

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    student_id = Column(String, index=True, nullable=False)
    title = Column(String, nullable=False, default="New Conversation")
    is_pinned = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False)
    summary = Column(Text, nullable=True)
    last_message_at = Column(DateTime, default=datetime.utcnow)
    message_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
