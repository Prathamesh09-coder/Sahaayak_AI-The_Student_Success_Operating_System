from sqlalchemy import Column, String, Float, DateTime
from sqlalchemy.sql import func
from app.models.base import Base

class MentorMatch(Base):
    __tablename__ = "mentor_matches"

    id = Column(String, primary_key=True, index=True)
    student_id = Column(String, index=True, nullable=False)
    mentor_id = Column(String, index=True, nullable=False)
    match_score = Column(Float)
    match_reason = Column(String)
    status = Column(String, default="RECOMMENDED") # RECOMMENDED, REQUESTED
    created_at = Column(DateTime(timezone=True), server_default=func.now())
