from sqlalchemy import Column, String, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
from app.models.base import Base

class Roadmap(Base):
    __tablename__ = "roadmaps"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    career_path_id = Column(String, ForeignKey("career_paths.id", ondelete="SET NULL"), nullable=True)
    title = Column(String, nullable=False)
    status = Column(String, default="active") # active, completed, abandoned
    completion_percentage = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    steps = relationship("RoadmapStep", back_populates="roadmap", cascade="all, delete-orphan")
    milestones = relationship("Milestone", back_populates="roadmap", cascade="all, delete-orphan")
