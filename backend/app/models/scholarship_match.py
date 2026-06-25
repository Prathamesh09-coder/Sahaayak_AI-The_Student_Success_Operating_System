from sqlalchemy import Column, String, DateTime, Float, Boolean, JSON
from sqlalchemy.sql import func
from app.models.base import Base

class ScholarshipMatch(Base):
    __tablename__ = "scholarship_matches"

    id = Column(String, primary_key=True, index=True)
    student_id = Column(String, index=True, nullable=False)
    scholarship_id = Column(String, index=True, nullable=False)
    eligibility_score = Column(Float)
    is_eligible = Column(Boolean)
    missing_requirements = Column(JSON) # List of missing strings
    created_at = Column(DateTime(timezone=True), server_default=func.now())
