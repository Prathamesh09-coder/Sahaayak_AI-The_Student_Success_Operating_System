from sqlalchemy import Column, String, Float, DateTime, Boolean, JSON, Enum
from sqlalchemy.sql import func
from app.models.base import Base
import enum

class ApplicationStatus(str, enum.Enum):
    SAVED = "SAVED"
    APPLIED = "APPLIED"
    INTERVIEW = "INTERVIEW"
    OFFERED = "OFFERED"
    REJECTED = "REJECTED"

class StudentApplication(Base):
    __tablename__ = "student_applications"

    id = Column(String, primary_key=True, index=True)
    student_id = Column(String, index=True, nullable=False)
    opportunity_id = Column(String, index=True, nullable=False)
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.SAVED)
    applied_at = Column(DateTime)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    notes = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
