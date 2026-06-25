from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from app.models.base import Base

class ParentProfile(Base):
    __tablename__ = "parent_profiles"

    id = Column(String, primary_key=True, index=True)
    student_id = Column(String, index=True, nullable=False)
    parent_name = Column(String)
    relation = Column(String)
    education_level = Column(String)
    preferred_language = Column(String, default="en")
    phone_number = Column(String)
    digital_literacy_level = Column(String, default="LOW")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
