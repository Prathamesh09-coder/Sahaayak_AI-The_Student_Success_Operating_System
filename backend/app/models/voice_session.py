from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.sql import func
from app.models.base import Base

class VoiceSession(Base):
    __tablename__ = "voice_sessions"

    id = Column(String, primary_key=True, index=True)
    student_id = Column(String, index=True)
    conversation_id = Column(String, index=True, nullable=True)
    language = Column(String, default="en")
    duration_seconds = Column(Integer, default=0)
    messages_count = Column(Integer, default=0)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    ended_at = Column(DateTime(timezone=True), nullable=True)
    transcript = Column(String, nullable=True)
    emotion = Column(String, default="neutral")
    status = Column(String, default="active")
