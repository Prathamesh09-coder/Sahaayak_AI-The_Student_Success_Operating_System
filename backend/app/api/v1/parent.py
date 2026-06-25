from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.parent_guidance_service import parent_guidance_service
from app.schemas.base import APIResponse

router = APIRouter()

class QueryRequest(BaseModel):
    student_id: str
    topic: str
    language: str

@router.post("/query", response_model=APIResponse)
async def query(req: QueryRequest, db: AsyncSession = Depends(get_db)):
    explanation = parent_guidance_service.explain_concept(req.topic, req.language)
    return APIResponse(success=True, message="Query explained", data={"explanation": explanation})

@router.get("/profile", response_model=APIResponse)
async def get_profile(student_id: str, db: AsyncSession = Depends(get_db)):
    res = {
        "parent_name": "Mock Parent",
        "preferred_language": "mr",
        "digital_literacy_level": "LOW"
    }
    return APIResponse(success=True, message="Parent profile fetched", data=res)

@router.put("/profile", response_model=APIResponse)
async def update_profile(student_id: str, data: dict, db: AsyncSession = Depends(get_db)):
    return APIResponse(success=True, message="Parent profile updated", data={"status": "updated"})
