from typing import Optional
from sqlalchemy import String, Integer, Float, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base
from datetime import datetime

class StudentGoal(Base):
    __tablename__ = "student_goals"

    student_id: Mapped[str] = mapped_column(String(255), ForeignKey("student_profiles.id", ondelete="CASCADE"), index=True)
    
    goal_title: Mapped[str] = mapped_column(String(255))
    goal_type: Mapped[str] = mapped_column(String(100)) # e.g. "Academic", "Career", "Skill"
    target_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    status: Mapped[str] = mapped_column(String(50), default="IN_PROGRESS")
    progress: Mapped[float] = mapped_column(Float, default=0.0) # Percentage 0-100
