from sqlalchemy import Column, String, DateTime, Integer, Text
from sqlalchemy import UUID
from datetime import datetime
import uuid
from app.models.base import Base

class StudentMemory(Base):
    __tablename__ = "student_memory"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    student_id = Column(String, index=True, nullable=False)
    memory_key = Column(String, nullable=False) # e.g. "Preferred Language", "Dream Career"
    memory_value = Column(Text, nullable=False)
    importance = Column(Integer, default=1) # 1 to 5
    last_used = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
