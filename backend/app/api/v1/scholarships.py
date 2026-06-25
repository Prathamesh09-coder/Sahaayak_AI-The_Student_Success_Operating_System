from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.scholarship_service import scholarship_service
from app.schemas.base import APIResponse

router = APIRouter()

@router.get("/", response_model=APIResponse)
async def get_scholarships(db: AsyncSession = Depends(get_db)):
    return APIResponse(success=True, message="Scholarships fetched", data=[])

@router.get("/recommended", response_model=APIResponse)
async def get_recommended_scholarships(student_id: str, db: AsyncSession = Depends(get_db)):
    mock_student = {
        "cgpa": 8.5,
        "income": 150000,
        "category": "OBC"
    }
    
    mock_scholarships = [
        {
            "id": "sch1",
            "title": "AICTE Pragati Scholarship",
            "provider": "AICTE",
            "eligibility_criteria": {
                "minimum_cgpa": 8.0
            }
        },
        {
             "id": "sch2",
            "title": "Post Matric Scholarship",
            "provider": "Government of India",
            "eligibility_criteria": {
                "minimum_cgpa": 6.0
            }
        }
    ]
    
    res = await scholarship_service.match_student(mock_student, mock_scholarships)
    return APIResponse(success=True, message="Recommended scholarships fetched", data=res)

@router.get("/{scholarship_id}", response_model=APIResponse)
async def get_scholarship(scholarship_id: str, db: AsyncSession = Depends(get_db)):
    return APIResponse(success=True, message="Scholarship fetched", data={"id": scholarship_id})
