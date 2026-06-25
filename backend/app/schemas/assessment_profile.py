from pydantic import BaseModel, Field
from datetime import datetime
import uuid

class AssessmentProfileBase(BaseModel):
    confidence_level: int = Field(ge=1, le=10, default=5)
    communication_skill: int = Field(ge=1, le=10, default=5)
    technical_skill: int = Field(ge=1, le=10, default=5)
    leadership_skill: int = Field(ge=1, le=10, default=5)
    stress_level: int = Field(ge=1, le=10, default=5)
    time_management: int = Field(ge=1, le=10, default=5)
    motivation_level: int = Field(ge=1, le=10, default=5)

class AssessmentProfileCreate(AssessmentProfileBase):
    pass

class AssessmentProfileUpdate(AssessmentProfileBase):
    pass

class AssessmentProfileResponse(AssessmentProfileBase):
    id: uuid.UUID
    student_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
