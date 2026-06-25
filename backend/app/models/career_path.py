from sqlalchemy import Column, String, Integer, DateTime, Text, Float
from datetime import datetime, timezone
import uuid
from app.models.base import Base

class CareerPath(Base):
    __tablename__ = "career_paths"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    industry = Column(String, nullable=True)
    average_salary = Column(Float, nullable=True)
    growth_rate = Column(Float, nullable=True)
    difficulty_level = Column(String, nullable=True) # e.g., Beginner, Intermediate, Advanced
    created_at = Column(DateTime, default=datetime.utcnow)
