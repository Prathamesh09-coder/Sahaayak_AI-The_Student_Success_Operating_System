from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.api import deps
from app.models.user import User
from app.services import dashboard_service
from app.schemas.dashboard import DashboardOverviewResponse
from app.repositories import profile_repository

router = APIRouter()

@router.get("/overview", response_model=dict)
async def get_overview(db: AsyncSession = Depends(get_db), current_user: User = Depends(deps.get_current_user)):
    student = await profile_repository.get_student_profile(db, str(current_user.id))
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    dashboard = await dashboard_service.get_dashboard_overview(db, str(student.id))
    
    return {
        "success": True,
        "message": "Dashboard fetched",
        "data": dashboard.model_dump()
    }
