from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

class StudentGoalBase(BaseModel):
    goal_title: str
    goal_type: str
    target_date: Optional[datetime] = None
    status: str = "IN_PROGRESS"
    progress: float = 0.0

class StudentGoalCreate(StudentGoalBase):
    pass

class StudentGoalUpdate(BaseModel):
    goal_title: Optional[str] = None
    goal_type: Optional[str] = None
    target_date: Optional[datetime] = None
    status: Optional[str] = None
    progress: Optional[float] = None

class StudentGoalResponse(StudentGoalBase):
    id: uuid.UUID
    student_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
