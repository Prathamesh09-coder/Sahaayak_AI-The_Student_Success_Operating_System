from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.permissions import require_admin

# Requires admin role for all routes in this router
router = APIRouter(dependencies=[Depends(require_admin)])

@router.get("/metrics")
async def get_platform_metrics(db: AsyncSession = Depends(get_db)):
    return {
        "total_students": 1250,
        "total_mentors": 45,
        "active_sessions": 12,
        "success_index_avg": 76.5,
        "interventions_triggered": 34
    }

@router.get("/users")
async def get_users(db: AsyncSession = Depends(get_db)):
    return []

@router.get("/audit-logs")
async def get_audit_logs(db: AsyncSession = Depends(get_db)):
    return []

@router.put("/feature-flags")
async def update_feature_flags(data: dict, db: AsyncSession = Depends(get_db)):
    return {"status": "updated", "flags": data}
