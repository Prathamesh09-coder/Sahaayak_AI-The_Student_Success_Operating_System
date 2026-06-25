from sqlalchemy import Column, String, Float, DateTime, Boolean, JSON, Enum
from sqlalchemy.sql import func
from app.models.base import Base
import enum

class OpportunityType(str, enum.Enum):
    INTERNSHIP = "INTERNSHIP"
    JOB = "JOB"
    HACKATHON = "HACKATHON"
    COMPETITION = "COMPETITION"
    FELLOWSHIP = "FELLOWSHIP"

class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    company = Column(String, nullable=False)
    description = Column(String)
    type = Column(Enum(OpportunityType))
    location = Column(String)
    stipend = Column(String)
    deadline = Column(DateTime)
    required_skills = Column(JSON) # List of skills
    minimum_cgpa = Column(Float)
    application_url = Column(String)
    is_remote = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
