from sqlalchemy import Column, String, Float, DateTime
from sqlalchemy.sql import func
from app.models.base import Base

class ForecastHistory(Base):
    __tablename__ = "forecast_history"

    id = Column(String, primary_key=True, index=True)
    student_id = Column(String, index=True, nullable=False)
    forecast_window = Column(String) # 30_DAYS, 90_DAYS, 180_DAYS
    predicted_score = Column(Float)
    actual_score = Column(Float, nullable=True) # Populated later
    accuracy = Column(Float, nullable=True) # Populated later
    created_at = Column(DateTime(timezone=True), server_default=func.now())
