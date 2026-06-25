from sqlalchemy import Column, String, DateTime, Boolean, Enum
from sqlalchemy.sql import func
from app.models.base import Base
import enum

class NotificationType(str, enum.Enum):
    SCHOLARSHIP = "SCHOLARSHIP"
    OPPORTUNITY = "OPPORTUNITY"
    DEADLINE = "DEADLINE"
    INTERVENTION = "INTERVENTION"
    MENTOR = "MENTOR"

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, index=True)
    student_id = Column(String, index=True, nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    type = Column(Enum(NotificationType))
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
