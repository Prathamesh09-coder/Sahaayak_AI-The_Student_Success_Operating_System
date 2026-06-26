from typing import Optional, List
from sqlalchemy import String, Float, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Float, ForeignKey, DateTime, JSON
from app.models.base import Base
from datetime import datetime, timezone

class DigitalTwin(Base):
    __tablename__ = "digital_twins"

    student_id: Mapped[str] = mapped_column(String(255), ForeignKey("student_profiles.id", ondelete="CASCADE"), unique=True, index=True)
    
    academic_score: Mapped[float] = mapped_column(Float, default=0.0)
    career_readiness: Mapped[float] = mapped_column(Float, default=0.0)
    financial_stability: Mapped[float] = mapped_column(Float, default=0.0)
    confidence_score: Mapped[float] = mapped_column(Float, default=0.0)
    engagement_score: Mapped[float] = mapped_column(Float, default=50.0)
    risk_score: Mapped[float] = mapped_column(Float, default=0.0)
    success_score: Mapped[float] = mapped_column(Float, default=0.0)
    
    ai_insights: Mapped[Optional[list]] = mapped_column(JSON, default=[])
    
    last_updated: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
