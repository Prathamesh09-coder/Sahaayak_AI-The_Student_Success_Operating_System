from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

class FamilyProfileBase(BaseModel):
    parent_education: Optional[str] = None
    annual_income: Optional[float] = None
    family_size: Optional[int] = None
    financial_status: Optional[str] = None
    first_generation_learner: bool = False
    guardian_occupation: Optional[str] = None

class FamilyProfileCreate(FamilyProfileBase):
    pass

class FamilyProfileUpdate(FamilyProfileBase):
    pass

class FamilyProfileResponse(FamilyProfileBase):
    id: uuid.UUID
    student_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
