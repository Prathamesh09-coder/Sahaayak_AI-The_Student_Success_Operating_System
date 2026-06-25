from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

class StudentProfileBase(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    college: Optional[str] = None
    branch: Optional[str] = None
    year: Optional[int] = None
    cgpa: Optional[float] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    preferred_language: Optional[str] = None
    bio: Optional[str] = None

class StudentProfileCreate(StudentProfileBase):
    pass

class StudentProfileUpdate(StudentProfileBase):
    pass

class StudentProfileResponse(StudentProfileBase):
    id: uuid.UUID
    user_id: uuid.UUID
    is_onboarding_completed: bool
    current_step: int
    profile_completeness: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
