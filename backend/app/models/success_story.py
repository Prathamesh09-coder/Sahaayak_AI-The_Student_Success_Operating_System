from sqlalchemy import Column, String, JSON, Boolean, DateTime
from sqlalchemy.sql import func
from app.models.base import Base

class SuccessStory(Base):
    __tablename__ = "success_stories"

    id = Column(String, primary_key=True, index=True)
    student_id = Column(String, index=True)
    title = Column(String, nullable=False)
    story = Column(String)
    career_outcome = Column(String)
    company = Column(String)
    tags = Column(JSON)
    featured = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
