from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.opportunity_service import opportunity_service
from app.services.application_service import application_service
from app.schemas.base import APIResponse

router = APIRouter()

@router.get("/", response_model=APIResponse)
async def get_opportunities(db: AsyncSession = Depends(get_db)):
    return APIResponse(success=True, message="Opportunities fetched", data=[])

@router.get("/recommended", response_model=APIResponse)
async def get_recommended_opportunities(student_id: str, db: AsyncSession = Depends(get_db)):
    mock_student = {
        "skills": ["Python", "React", "SQL"],
        "cgpa": 8.5,
        "location": "Mumbai",
        "prefers_remote": True
    }
    
    mock_opportunities = [
        {
            "id": "opp1",
            "title": "Software Engineering Intern",
            "company": "Google",
            "required_skills": ["Python", "System Design", "Algorithms"],
            "minimum_cgpa": 8.0,
            "location": "Bangalore",
            "is_remote": False
        },
        {
            "id": "opp2",
            "title": "Frontend Developer",
            "company": "Atlassian",
            "required_skills": ["React", "TypeScript", "CSS"],
            "minimum_cgpa": 7.5,
            "location": "Remote",
            "is_remote": True
        }
    ]
    
    res = await opportunity_service.match_student(mock_student, mock_opportunities)
    return APIResponse(success=True, message="Recommendations fetched", data=res)

@router.post("/{opportunity_id}/apply", response_model=APIResponse)
async def apply_opportunity(opportunity_id: str, student_id: str, db: AsyncSession = Depends(get_db)):
    res = await application_service.track_application(student_id, opportunity_id, "APPLIED")
    return APIResponse(success=True, message="Application tracked", data=res)
