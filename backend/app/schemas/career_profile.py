from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid

class CareerProfileBase(BaseModel):
    dream_career: Optional[str] = None
    target_companies: Optional[List[str]] = []
    interests: Optional[List[str]] = []
    skills: Optional[List[str]] = []
    preferred_work_mode: Optional[str] = None
    career_confidence: Optional[int] = None

class CareerProfileCreate(CareerProfileBase):
    pass

class CareerProfileUpdate(CareerProfileBase):
    pass

class CareerProfileResponse(CareerProfileBase):
    id: uuid.UUID
    student_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
