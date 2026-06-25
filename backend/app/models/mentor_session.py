from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.sql import func
from app.models.base import Base

class MentorSession(Base):
    __tablename__ = "mentor_sessions"

    id = Column(String, primary_key=True, index=True)
    mentor_id = Column(String, index=True, nullable=False)
    student_id = Column(String, index=True, nullable=False)
    scheduled_at = Column(DateTime)
    duration_minutes = Column(Integer)
    meeting_link = Column(String)
    status = Column(String, default="REQUESTED") # REQUESTED, CONFIRMED, COMPLETED, CANCELLED
    feedback = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
