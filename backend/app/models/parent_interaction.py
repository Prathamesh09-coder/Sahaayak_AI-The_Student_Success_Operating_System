from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from app.models.base import Base

class ParentInteraction(Base):
    __tablename__ = "parent_interactions"

    id = Column(String, primary_key=True, index=True)
    parent_profile_id = Column(String, index=True, nullable=False)
    question = Column(String, nullable=False)
    response = Column(String)
    language = Column(String, default="en")
    interaction_mode = Column(String, default="TEXT") # VOICE or TEXT
    created_at = Column(DateTime(timezone=True), server_default=func.now())
