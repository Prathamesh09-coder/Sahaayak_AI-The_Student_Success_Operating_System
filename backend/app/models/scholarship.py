from sqlalchemy import Column, String, Float, DateTime, Boolean, JSON
from sqlalchemy.sql import func
from app.models.base import Base

class Scholarship(Base):
    __tablename__ = "scholarships"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    provider = Column(String, nullable=False)
    description = Column(String)
    amount = Column(String)
    deadline = Column(DateTime)
    eligibility_criteria = Column(JSON)
    category = Column(String)
    application_url = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
