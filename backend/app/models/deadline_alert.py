from sqlalchemy import Column, String, DateTime, Boolean, Integer
from sqlalchemy.sql import func
from app.models.base import Base

class DeadlineAlert(Base):
    __tablename__ = "deadline_alerts"

    id = Column(String, primary_key=True, index=True)
    student_id = Column(String, index=True, nullable=False)
    entity_type = Column(String, nullable=False) # e.g., SCHOLARSHIP, OPPORTUNITY
    entity_id = Column(String, nullable=False)
    deadline = Column(DateTime, nullable=False)
    days_remaining = Column(Integer)
    is_notified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
