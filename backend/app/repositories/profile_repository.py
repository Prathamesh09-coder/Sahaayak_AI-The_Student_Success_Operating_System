from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, Any
from app.models.student_profile import StudentProfile
from app.models.family_profile import FamilyProfile
from app.models.career_profile import CareerProfile
from app.models.assessment_profile import AssessmentProfile
from app.models.student_goal import StudentGoal

async def get_student_profile(db: AsyncSession, user_id: str) -> Optional[StudentProfile]:
    """Look up StudentProfile by the owning User's ID (user_id)."""
    result = await db.execute(select(StudentProfile).where(StudentProfile.user_id == user_id))
    return result.scalars().first()

async def get_student_profile_by_id(db: AsyncSession, student_id: str) -> Optional[StudentProfile]:
    """Look up StudentProfile by its own primary key (StudentProfile.id)."""
    result = await db.execute(select(StudentProfile).where(StudentProfile.id == student_id))
    return result.scalars().first()

async def get_family_profile(db: AsyncSession, student_id: str) -> Optional[FamilyProfile]:
    result = await db.execute(select(FamilyProfile).where(FamilyProfile.student_id == student_id))
    return result.scalars().first()

async def get_career_profile(db: AsyncSession, student_id: str) -> Optional[CareerProfile]:
    result = await db.execute(select(CareerProfile).where(CareerProfile.student_id == student_id))
    return result.scalars().first()

async def get_assessment_profile(db: AsyncSession, student_id: str) -> Optional[AssessmentProfile]:
    result = await db.execute(select(AssessmentProfile).where(AssessmentProfile.student_id == student_id))
    return result.scalars().first()

async def get_student_goals(db: AsyncSession, student_id: str) -> list[StudentGoal]:
    result = await db.execute(select(StudentGoal).where(StudentGoal.student_id == student_id))
    return result.scalars().all()

async def save_profile(db: AsyncSession, obj_in: Any) -> Any:
    db.add(obj_in)
    await db.commit()
    await db.refresh(obj_in)
    return obj_in
