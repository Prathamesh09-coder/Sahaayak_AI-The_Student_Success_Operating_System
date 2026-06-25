from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.mentor_matching_service import mentor_matching_service
from app.services.session_service import session_service
from app.schemas.base import APIResponse

router = APIRouter()

@router.get("/recommended", response_model=APIResponse)
async def get_recommended_mentors(student_id: str, db: AsyncSession = Depends(get_db)):
    mock_student = {
        "career_goal": "ML Engineer",
        "skills": ["Python", "Machine Learning"],
        "is_first_generation": True,
        "languages": ["Marathi", "English"],
        "location": "Maharashtra"
    }
    
    mock_mentors = [
        {
            "id": "mentor1",
            "name": "Arjun Patil",
            "designation": "Senior ML Engineer",
            "company": "NVIDIA",
            "career_goal": "ML Engineer",
            "skills": ["Python", "Machine Learning", "Deep Learning"],
            "is_first_generation": True,
            "languages": ["Marathi", "English"],
            "location": "Maharashtra"
        },
        {
            "id": "mentor2",
            "name": "Sarah Chen",
            "designation": "Data Scientist",
            "company": "Google",
            "career_goal": "Data Scientist",
            "skills": ["Python", "SQL"],
            "is_first_generation": False,
            "languages": ["English"],
            "location": "Bangalore"
        }
    ]
    
    res = await mentor_matching_service.get_recommended_mentors(mock_student, mock_mentors)
    return APIResponse(success=True, message="Recommended mentors fetched", data=res)

@router.get("/{id}", response_model=APIResponse)
async def get_mentor(id: str, db: AsyncSession = Depends(get_db)):
    return APIResponse(success=True, message="Mentor fetched", data={"id": id, "name": "Mock Mentor"})

@router.post("/request-session", response_model=APIResponse)
async def request_session(mentor_id: str, student_id: str, db: AsyncSession = Depends(get_db)):
    res = session_service.request_session(student_id, mentor_id)
    return APIResponse(success=True, message="Session requested", data=res)
