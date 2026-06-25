from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from app.models.base import Base

class SuccessRecommendation(Base):
    __tablename__ = "success_recommendations"

    id = Column(String, primary_key=True, index=True)
    student_id = Column(String, index=True, nullable=False)
    category = Column(String) # ACADEMIC, CAREER, FINANCIAL, SOCIAL, WELLNESS
    title = Column(String, nullable=False)
    description = Column(String)
    priority = Column(String, default="NORMAL") # HIGH, NORMAL, LOW
    status = Column(String, default="PENDING") # PENDING, COMPLETED, DISMISSED
    created_at = Column(DateTime(timezone=True), server_default=func.now())
