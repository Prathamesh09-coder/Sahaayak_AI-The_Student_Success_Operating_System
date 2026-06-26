from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.mentor_matching_service import mentor_matching_service
from app.services.session_service import session_service
from app.schemas.base import APIResponse

router = APIRouter()

from app.repositories import profile_repository
import logging

logger = logging.getLogger(__name__)

@router.get("/recommended", response_model=APIResponse)
async def get_recommended_mentors(student_id: str, db: AsyncSession = Depends(get_db)):
    try:
        # Fetch actual student profile
        student = await profile_repository.get_student_profile(db, student_id)

        # Build dynamic profile dictionary
        student_data = {
            "career_goal": "",
            "skills": [],
            "is_first_generation": False,
            "languages": ["English"],
            "location": "Maharashtra" # Default/Mock
        }

        if student:
            career = await profile_repository.get_career_profile(db, str(student.id))
            family = await profile_repository.get_family_profile(db, str(student.id))
            
            if career:
                student_data["career_goal"] = career.dream_career or ""
                student_data["skills"] = career.skills or []
            if family:
                student_data["is_first_generation"] = family.first_generation_learner
            if student.preferred_language:
                student_data["languages"] = [student.preferred_language, "English"]
        
        # Curated Mock Mentor Dataset
        mock_mentors = [
            {
                "id": "mentor_1",
                "name": "Arjun Patil",
                "designation": "Senior SDE",
                "company": "Atlassian",
                "career_goal": "Software Engineer",
                "skills": ["React", "Node.js", "System Design"],
                "is_first_generation": True,
                "languages": ["Marathi", "English"],
                "location": "Maharashtra",
                "availability": "Weekends (4hrs)"
            },
            {
                "id": "mentor_2",
                "name": "Sarah Chen",
                "designation": "Data Scientist",
                "company": "Google",
                "career_goal": "Data Scientist",
                "skills": ["Python", "SQL", "Machine Learning"],
                "is_first_generation": False,
                "languages": ["English", "Hindi"],
                "location": "Bangalore",
                "availability": "Tuesdays (2hrs)"
            },
            {
                "id": "mentor_3",
                "name": "Rahul Sharma",
                "designation": "Product Manager",
                "company": "Flipkart",
                "career_goal": "Product Manager",
                "skills": ["Agile", "Product Strategy", "Figma"],
                "is_first_generation": True,
                "languages": ["Hindi", "English"],
                "location": "Delhi",
                "availability": "Weekdays Evening"
            },
            {
                "id": "mentor_4",
                "name": "Neha Gupta",
                "designation": "Frontend Architect",
                "company": "Zomato",
                "career_goal": "Frontend Engineer",
                "skills": ["React", "TypeScript", "UI/UX"],
                "is_first_generation": False,
                "languages": ["English"],
                "location": "Maharashtra",
                "availability": "Sundays (1hr)"
            },
            {
                "id": "mentor_5",
                "name": "Vikram Singh",
                "designation": "Cloud DevOps Engineer",
                "company": "Amazon Web Services",
                "career_goal": "Cloud Engineer",
                "skills": ["AWS", "Kubernetes", "Docker"],
                "is_first_generation": True,
                "languages": ["English", "Telugu"],
                "location": "Hyderabad",
                "availability": "Flexible"
            },
            {
                "id": "mentor_6",
                "name": "Ananya Desai",
                "designation": "Financial Analyst",
                "company": "JPMorgan Chase",
                "career_goal": "Financial Analyst",
                "skills": ["Excel", "Financial Modeling", "Python"],
                "is_first_generation": False,
                "languages": ["Gujarati", "English", "Hindi"],
                "location": "Maharashtra",
                "availability": "Saturday Mornings"
            }
        ]
        
        res = await mentor_matching_service.get_recommended_mentors(student_data, mock_mentors)
        return APIResponse(success=True, message="Recommended mentors fetched dynamically", data=res)
    except Exception as e:
        logger.error(f"Failed to fetch dynamic mentors: {e}")
        return APIResponse(success=False, message="Failed to fetch mentors", data=[])

@router.get("/{id}", response_model=APIResponse)
async def get_mentor(id: str, db: AsyncSession = Depends(get_db)):
    return APIResponse(success=True, message="Mentor fetched", data={"id": id, "name": "Mock Mentor"})

@router.post("/request-session", response_model=APIResponse)
async def request_session(mentor_id: str, student_id: str, db: AsyncSession = Depends(get_db)):
    res = session_service.request_session(student_id, mentor_id)
    return APIResponse(success=True, message="Session requested", data=res)
