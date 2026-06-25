from sqlalchemy import Column, String, Float, DateTime
from sqlalchemy.sql import func
from app.models.base import Base

class PredictiveInsight(Base):
    __tablename__ = "predictive_insights"

    id = Column(String, primary_key=True, index=True)
    student_id = Column(String, index=True, nullable=False)
    type = Column(String) # Placement Risk, Dropout Risk, Scholarship Risk, Career Risk
    risk_level = Column(String) # LOW, MEDIUM, HIGH, CRITICAL
    prediction = Column(String)
    confidence = Column(Float, default=0.0)
    recommended_action = Column(String)
    explanation = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
