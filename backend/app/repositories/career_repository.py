from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List
from app.models.career_path import CareerPath

async def get_career_path(db: AsyncSession, career_id: str) -> Optional[CareerPath]:
    """Retrieve a career path by its ID."""
    result = await db.execute(select(CareerPath).where(CareerPath.id == career_id))
    return result.scalar_one_or_none()

async def get_career_path_by_name(db: AsyncSession, name: str) -> Optional[CareerPath]:
    """Retrieve a career path by its name (case-insensitive)."""
    result = await db.execute(
        select(CareerPath).where(CareerPath.name.ilike(name))
    )
    return result.scalars().first()

async def get_all_career_paths(db: AsyncSession) -> List[CareerPath]:
    """Retrieve all career paths."""
    result = await db.execute(select(CareerPath))
    return result.scalars().all()

async def create_career_path(
    db: AsyncSession,
    name: str,
    description: Optional[str] = None,
    industry: Optional[str] = None,
    average_salary: Optional[float] = None,
    growth_rate: Optional[float] = None,
    difficulty_level: Optional[str] = None
) -> CareerPath:
    """Create a new career path."""
    career_path = CareerPath(
        name=name,
        description=description,
        industry=industry,
        average_salary=average_salary,
        growth_rate=growth_rate,
        difficulty_level=difficulty_level
    )
    db.add(career_path)
    await db.commit()
    await db.refresh(career_path)
    return career_path
