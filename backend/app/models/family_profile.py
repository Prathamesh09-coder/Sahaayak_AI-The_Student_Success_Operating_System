from typing import Optional
from sqlalchemy import String, Integer, Float, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base

class FamilyProfile(Base):
    __tablename__ = "family_profiles"

    student_id: Mapped[str] = mapped_column(String(255), ForeignKey("student_profiles.id", ondelete="CASCADE"), unique=True, index=True)
    
    parent_education: Mapped[Optional[str]] = mapped_column(String(255))
    annual_income: Mapped[Optional[float]] = mapped_column(Float)
    family_size: Mapped[Optional[int]] = mapped_column(Integer)
    financial_status: Mapped[Optional[str]] = mapped_column(String(100))
    first_generation_learner: Mapped[bool] = mapped_column(Boolean, default=False)
    guardian_occupation: Mapped[Optional[str]] = mapped_column(String(255))
