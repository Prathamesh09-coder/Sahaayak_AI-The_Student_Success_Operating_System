import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories import profile_repository, digital_twin_repository
from app.services import memory_service

async def load_student_context(db: AsyncSession, student_id: str) -> dict:
    # student_id here is the user_id passed from the frontend auth context
    cached = await memory_service.get_cached_context(student_id)
    if cached:
        return cached

    profile = await profile_repository.get_student_profile(db, student_id)
    if not profile:
        return {
            "dream_career": None,
            "cgpa": None,
            "risk_score": 0.0,
            "financial_status": "Stable",
            "skills": []
        }

    student_profile_id = str(profile.id)
    career = await profile_repository.get_career_profile(db, student_profile_id)
    goals = await profile_repository.get_student_goals(db, student_profile_id)
    twin = await digital_twin_repository.get_digital_twin(db, student_profile_id)
    
    # Process financial status mapping based on score
    financial_status = "Stable"
    if twin and twin.financial_stability < 40:
        financial_status = "Low Income"
    elif twin and twin.financial_stability < 70:
        financial_status = "Moderate Income"
        
    context = {
        "dream_career": career.dream_career if career else None,
        "cgpa": profile.cgpa if profile else None,
        "risk_score": twin.risk_score if twin else 0.0,
        "financial_status": financial_status,
        "skills": career.skills if career else []
    }
    
    await memory_service.cache_context(student_id, context)
    return context
