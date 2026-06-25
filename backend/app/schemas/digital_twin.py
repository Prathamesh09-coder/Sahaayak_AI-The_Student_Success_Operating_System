from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid

class DigitalTwinResponse(BaseModel):
    academic_score: float
    career_readiness: float
    financial_stability: float
    confidence_score: float
    engagement_score: float
    risk_score: float
    success_score: float
    ai_insights: Optional[List[str]] = []
    
    last_updated: datetime

    class Config:
        from_attributes = True
