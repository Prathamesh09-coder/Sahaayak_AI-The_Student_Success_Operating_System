from typing import Optional, List
from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, ForeignKey, JSON
from app.models.base import Base

class CareerProfile(Base):
    __tablename__ = "career_profiles"

    student_id: Mapped[str] = mapped_column(String(255), ForeignKey("student_profiles.id", ondelete="CASCADE"), unique=True, index=True)
    
    dream_career: Mapped[Optional[str]] = mapped_column(String(255))
    target_companies: Mapped[Optional[List[str]]] = mapped_column(JSON)
    interests: Mapped[Optional[List[str]]] = mapped_column(JSON)
    skills: Mapped[Optional[List[str]]] = mapped_column(JSON)
    
    preferred_work_mode: Mapped[Optional[str]] = mapped_column(String(50))
    career_confidence: Mapped[Optional[int]] = mapped_column(Integer) # Scale 1-100 maybe
