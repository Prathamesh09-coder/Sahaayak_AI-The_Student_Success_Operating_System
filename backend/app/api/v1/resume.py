from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.api import deps
from app.models.user import User
from app.schemas.base import APIResponse
from app.services.resume_service import resume_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/analyze", response_model=APIResponse)
async def analyze_resume(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")
        
    if not file.filename.lower().endswith(('.pdf', '.docx', '.txt')):
        raise HTTPException(status_code=400, detail="Only PDF, DOCX, and TXT files are supported")

    try:
        content = await file.read()
        if len(content) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large. Max 5MB.")
            
        result = await resume_service.analyze_resume(content, file.filename)
        return APIResponse(success=True, message="Resume analyzed successfully", data=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in analyze_resume: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while analyzing the resume")
