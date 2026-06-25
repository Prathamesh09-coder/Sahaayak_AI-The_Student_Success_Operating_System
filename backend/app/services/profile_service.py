from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories import profile_repository
from app.models.student_profile import StudentProfile
from app.models.family_profile import FamilyProfile
from app.models.career_profile import CareerProfile
from app.models.assessment_profile import AssessmentProfile
from app.models.student_goal import StudentGoal
from app.services import memory_service
import uuid

async def calculate_profile_completeness(db: AsyncSession, student_id: str) -> float:
    # student_id here is the user_id passed from the controller
    score = 0.0
    profile = await profile_repository.get_student_profile(db, student_id)
    if not profile:
        return score
        
    score += 20.0 # Student profile exists
    
    student_profile_id = str(profile.id)
    if await profile_repository.get_family_profile(db, student_profile_id):
        score += 20.0
    if await profile_repository.get_career_profile(db, student_profile_id):
        score += 20.0
    if await profile_repository.get_student_goals(db, student_profile_id):
        score += 20.0
    if await profile_repository.get_assessment_profile(db, student_profile_id):
        score += 20.0
        
    profile.profile_completeness = score
    await profile_repository.save_profile(db, profile)
    
    # Clear Redis context cache to force reload of fresh PostgreSQL data for AI features
    await memory_service.invalidate_context_cache(student_id)
        
    return score

async def mark_onboarding_completed(db: AsyncSession, student_id: str) -> StudentProfile:
    profile = await profile_repository.get_student_profile(db, student_id)
    if not profile:
        raise ValueError("Profile not found")
        
    profile.is_onboarding_completed = True
    return await profile_repository.save_profile(db, profile)
