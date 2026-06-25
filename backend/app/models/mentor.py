from sqlalchemy import Column, String, Integer, Float, Boolean, JSON, DateTime
from sqlalchemy.sql import func
from app.models.base import Base

class Mentor(Base):
    __tablename__ = "mentors"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False)
    company = Column(String)
    designation = Column(String)
    experience_years = Column(Integer)
    bio = Column(String)
    skills = Column(JSON) # list of skills
    languages = Column(JSON) # list of languages
    location = Column(String)
    availability = Column(JSON) # e.g. schedule
    is_verified = Column(Boolean, default=False)
    rating = Column(Float, default=0.0)
    total_sessions = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
