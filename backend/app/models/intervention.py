from sqlalchemy import Column, String, DateTime, Float, Enum, Boolean
from sqlalchemy.sql import func
from app.models.base import Base
import enum

class InterventionCategory(str, enum.Enum):
    ACADEMIC = "ACADEMIC"
    CAREER = "CAREER"
    FINANCIAL = "FINANCIAL"
    MENTAL_WELLNESS = "MENTAL_WELLNESS"
    ENGAGEMENT = "ENGAGEMENT"
    PLACEMENT = "PLACEMENT"

class Intervention(Base):
    __tablename__ = "interventions"

    id = Column(String, primary_key=True, index=True)
    student_id = Column(String, index=True, nullable=False)
    type = Column(Enum(InterventionCategory))
    severity = Column(String) # HIGH, MEDIUM, LOW
    reason = Column(String)
    recommended_action = Column(String)
    status = Column(String, default="PENDING") # PENDING, RESOLVED
    risk_score = Column(Float)
    trigger_source = Column(String) # e.g., MISSED_SCHOLARSHIP
    resolved_at = Column(DateTime)
    resolved_by = Column(String)
    is_auto_generated = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
