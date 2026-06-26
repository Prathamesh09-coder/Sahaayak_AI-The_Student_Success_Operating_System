from sqlalchemy import Column, String, Integer, Text, Boolean, Float, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy import JSON
import uuid
from app.models.base import Base

class RoadmapStep(Base):
    __tablename__ = "roadmap_steps"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    roadmap_id = Column(String, ForeignKey("roadmaps.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    step_order = Column(Integer, nullable=False)
    
    # AI optimization fields
    skill_id = Column(String, ForeignKey("skills.id", ondelete="SET NULL"), nullable=True)
    difficulty = Column(String, nullable=True)
    estimated_hours = Column(Float, nullable=True)
    resource_type = Column(String, nullable=True) # course, video, project, article
    is_mandatory = Column(Boolean, default=True)

    status = Column(String, default="pending") # pending, in_progress, completed
    resource_links = Column(JSON, nullable=True) # List of URLs or resource dicts

    roadmap = relationship("Roadmap", back_populates="steps")
