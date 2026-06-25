from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base

class AssessmentProfile(Base):
    __tablename__ = "assessment_profiles"

    student_id: Mapped[str] = mapped_column(String(255), ForeignKey("student_profiles.id", ondelete="CASCADE"), unique=True, index=True)
    
    # All scales 1-10
    confidence_level: Mapped[int] = mapped_column(Integer, default=5)
    communication_skill: Mapped[int] = mapped_column(Integer, default=5)
    technical_skill: Mapped[int] = mapped_column(Integer, default=5)
    leadership_skill: Mapped[int] = mapped_column(Integer, default=5)
    stress_level: Mapped[int] = mapped_column(Integer, default=5)
    time_management: Mapped[int] = mapped_column(Integer, default=5)
    motivation_level: Mapped[int] = mapped_column(Integer, default=5)
