from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid

class Alert(BaseModel):
    id: str
    type: str  # "warning", "info", "success", "error"
    message: str
    action_url: Optional[str] = None

class Activity(BaseModel):
    id: str
    title: str
    description: str
    timestamp: datetime

class DashboardOverviewResponse(BaseModel):
    student_name: str
    success_index: float
    profile_completeness: float
    risk_score: float
    confidence_score: float
    upcoming_deadlines: list = []
    recommendations: list = []
    goals_progress: dict = {"completed": 0, "pending": 0, "progress_percentage": 0.0}
    scholarships: list = []
    opportunities: list = []
    mentor_suggestions: list = []
    recent_activities: list = []
    digital_twin_summary: dict = {}
    notifications_count: int = 0
    last_updated: Optional[datetime] = None

    class Config:
        from_attributes = True
