from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.session_service import session_service

router = APIRouter()

@router.get("/")
async def get_sessions(student_id: str, db: AsyncSession = Depends(get_db)):
    return []

@router.put("/{id}")
async def update_session(id: str, status: str, db: AsyncSession = Depends(get_db)):
    if status == "CONFIRMED":
        return session_service.confirm_session(id)
    elif status == "CANCELLED":
        return session_service.cancel_session(id)
    return {"id": id, "status": status}
