from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey
from datetime import datetime, timezone
import uuid
from app.models.base import Base

class StudentSkill(Base):
    __tablename__ = "student_skills"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(String, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    proficiency_level = Column(String, nullable=True) # e.g., Beginner, Intermediate, Advanced
    verified = Column(Boolean, default=False)
    source = Column(String, nullable=True) # e.g., self-reported, assessment, course_completion
    created_at = Column(DateTime, default=datetime.utcnow)
