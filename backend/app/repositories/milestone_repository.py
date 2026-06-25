from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from app.models.milestone import Milestone
from datetime import datetime

async def get_roadmap_milestones(db: AsyncSession, roadmap_id: str) -> List[Milestone]:
    """Retrieve all milestones for a specific roadmap."""
    result = await db.execute(
        select(Milestone)
        .where(Milestone.roadmap_id == roadmap_id)
        .order_by(Milestone.target_date.asc())
    )
    return result.scalars().all()

async def create_milestone(
    db: AsyncSession,
    roadmap_id: str,
    title: str,
    description: Optional[str] = None,
    target_date: Optional[datetime] = None,
    reward_points: int = 0
) -> Milestone:
    """Create a new milestone in the database."""
    milestone = Milestone(
        roadmap_id=roadmap_id,
        title=title,
        description=description,
        target_date=target_date,
        completed=False,
        reward_points=reward_points
    )
    db.add(milestone)
    await db.commit()
    await db.refresh(milestone)
    return milestone

async def get_milestone(db: AsyncSession, milestone_id: str) -> Optional[Milestone]:
    """Retrieve a milestone by its ID."""
    result = await db.execute(select(Milestone).where(Milestone.id == milestone_id))
    return result.scalar_one_or_none()

async def update_milestone_status(db: AsyncSession, milestone_id: str, completed: bool) -> Optional[Milestone]:
    """Update a milestone's completion status."""
    milestone = await get_milestone(db, milestone_id)
    if milestone:
        milestone.completed = completed
        db.add(milestone)
        await db.commit()
        await db.refresh(milestone)
    return milestone
