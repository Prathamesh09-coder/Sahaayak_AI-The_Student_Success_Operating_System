from sqlalchemy import Column, String, Integer, Float, DateTime
from sqlalchemy.sql import func
from app.models.base import Base

class SuccessIndex(Base):
    __tablename__ = "success_indices"

    id = Column(String, primary_key=True, index=True)
    student_id = Column(String, index=True, nullable=False, unique=True)
    academic_score = Column(Float, default=0.0)
    career_score = Column(Float, default=0.0)
    engagement_score = Column(Float, default=0.0)
    financial_score = Column(Float, default=0.0)
    social_capital_score = Column(Float, default=0.0)
    wellness_score = Column(Float, default=0.0)
    overall_score = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
