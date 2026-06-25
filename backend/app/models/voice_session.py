from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.sql import func
from app.models.base import Base

class VoiceSession(Base):
    __tablename__ = "voice_sessions"

    id = Column(String, primary_key=True, index=True)
    student_id = Column(String, index=True)
    language = Column(String, default="en")
    duration_seconds = Column(Integer, default=0)
    transcript = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
