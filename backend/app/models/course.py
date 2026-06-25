from sqlalchemy import Column, String, Integer, Boolean, Float
import uuid
from app.models.base import Base

class Course(Base):
    __tablename__ = "courses"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    provider = Column(String, nullable=True) # e.g., Coursera, Udemy
    difficulty = Column(String, nullable=True)
    duration_hours = Column(Float, nullable=True)
    url = Column(String, nullable=True)
    is_free = Column(Boolean, default=False)
