from sqlalchemy import Column, String, DateTime, Float, JSON
from sqlalchemy.sql import func
from app.models.base import Base

class OpportunityMatch(Base):
    __tablename__ = "opportunity_matches"

    id = Column(String, primary_key=True, index=True)
    student_id = Column(String, index=True, nullable=False)
    opportunity_id = Column(String, index=True, nullable=False)
    match_score = Column(Float)
    missing_skills = Column(JSON) # List of skills
    recommended_actions = Column(JSON) # List of action strings
    status = Column(String, default="RECOMMENDED") # RECOMMENDED, DISMISSED, APPLIED
    created_at = Column(DateTime(timezone=True), server_default=func.now())
