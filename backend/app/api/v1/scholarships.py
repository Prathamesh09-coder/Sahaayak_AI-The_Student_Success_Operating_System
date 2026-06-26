from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.scholarship_service import scholarship_service
from app.schemas.base import APIResponse
from app.repositories import profile_repository

router = APIRouter()

@router.get("/", response_model=APIResponse)
async def get_scholarships(db: AsyncSession = Depends(get_db)):
    return APIResponse(success=True, message="Scholarships fetched", data=[])

@router.get("/recommended", response_model=APIResponse)
async def get_recommended_scholarships(student_id: str, db: AsyncSession = Depends(get_db)):
    # Fetch real student profile (note: student_id passed from frontend is the User.id)
    student = await profile_repository.get_student_profile(db, student_id)
    
    if not student:
        # Graceful fallback for users with no profile
        student_dict = {"cgpa": 0.0, "skills": [], "location": ""}
    else:
        # Also fetch career profile for skills if available
        career = await profile_repository.get_career_profile(db, str(student.id))
        skills = career.skills if career and career.skills else []
        
        student_dict = {
            "cgpa": student.cgpa or 0.0,
            "skills": skills,
            "location": student.state or student.city or "",
            "prefers_remote": True
        }
    
    # Comprehensive, realistic list of Indian scholarships
    mock_scholarships = [
        {
            "id": "sch-aicte-pragati",
            "title": "AICTE Pragati Scholarship for Girls",
            "provider": "AICTE",
            "deadline": "2026-10-31",
            "url": "https://www.aicte-india.org/schemes/students-development-schemes/Pragati-Scholarship-Scheme",
            "eligibility_criteria": {
                "minimum_cgpa": 8.0,
                "required_skills": []
            }
        },
        {
            "id": "sch-tata-merit",
            "title": "Tata Millennium Merit Scholarship",
            "provider": "Tata Trusts",
            "deadline": "2026-09-15",
            "url": "https://www.tatatrusts.org/our-work/individual-grants-initiative/education-grants",
            "eligibility_criteria": {
                "minimum_cgpa": 8.5,
                "required_skills": ["Leadership", "Communication"]
            }
        },
        {
            "id": "sch-ongc-merit",
            "title": "ONGC Merit Scholarship for SC/ST/OBC",
            "provider": "ONGC Foundation",
            "deadline": "2026-11-20",
            "url": "https://ongcscholar.org/",
            "eligibility_criteria": {
                "minimum_cgpa": 6.5,
                "required_skills": []
            }
        },
        {
            "id": "sch-post-matric",
            "title": "Post Matric Scholarship for Minorities",
            "provider": "Ministry of Minority Affairs",
            "deadline": "2026-08-30",
            "url": "https://scholarships.gov.in/",
            "eligibility_criteria": {
                "minimum_cgpa": 5.0,
                "required_skills": []
            }
        },
        {
            "id": "sch-sahaayak-tech",
            "title": "Sahaayak AI Future Innovators Award",
            "provider": "Sahaayak AI Foundation",
            "deadline": "2026-12-01",
            "url": "https://sahaayak.ai/scholarships",
            "eligibility_criteria": {
                "minimum_cgpa": 7.5,
                "required_skills": ["Python", "Machine Learning", "Data Structures"]
            }
        },
        {
            "id": "sch-reliance-ug",
            "title": "Reliance Foundation Undergraduate Scholarship",
            "provider": "Reliance Foundation",
            "deadline": "2026-10-15",
            "url": "https://scholarships.reliancefoundation.org/",
            "eligibility_criteria": {
                "minimum_cgpa": 7.0,
                "required_skills": []
            }
        }
    ]
    
    # Calculate eligibility scores and sort
    res = await scholarship_service.match_student(student_dict, mock_scholarships)
    return APIResponse(success=True, message="Recommended scholarships fetched", data=res)

@router.get("/{scholarship_id}", response_model=APIResponse)
async def get_scholarship(scholarship_id: str, db: AsyncSession = Depends(get_db)):
    return APIResponse(success=True, message="Scholarship fetched", data={"id": scholarship_id})
