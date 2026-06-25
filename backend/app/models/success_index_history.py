from sqlalchemy import Column, String, Float, DateTime
from sqlalchemy.sql import func
from app.models.base import Base

class SuccessIndexHistory(Base):
    __tablename__ = "success_index_history"

    id = Column(String, primary_key=True, index=True)
    student_id = Column(String, index=True, nullable=False)
    overall_score = Column(Float, nullable=False)
    snapshot = Column(String) # JSON string of all component scores
    created_at = Column(DateTime(timezone=True), server_default=func.now())
