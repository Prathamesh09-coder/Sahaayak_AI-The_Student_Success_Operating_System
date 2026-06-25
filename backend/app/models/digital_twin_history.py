from sqlalchemy import String, Float, ForeignKey, DateTime, Integer
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base
from datetime import datetime, timezone

class DigitalTwinHistory(Base):
    __tablename__ = "digital_twin_history"

    student_id: Mapped[str] = mapped_column(String(255), ForeignKey("student_profiles.id", ondelete="CASCADE"), index=True)
    
    academic_score: Mapped[float] = mapped_column(Float, default=0.0)
    career_readiness: Mapped[float] = mapped_column(Float, default=0.0)
    financial_stability: Mapped[float] = mapped_column(Float, default=0.0)
    confidence_score: Mapped[float] = mapped_column(Float, default=0.0)
    engagement_score: Mapped[float] = mapped_column(Float, default=50.0)
    risk_score: Mapped[float] = mapped_column(Float, default=0.0)
    success_score: Mapped[float] = mapped_column(Float, default=0.0)
    
    version: Mapped[int] = mapped_column(Integer, default=1)
    trigger_source: Mapped[str] = mapped_column(String(100), default="onboarding_completion")
