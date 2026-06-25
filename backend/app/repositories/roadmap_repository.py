from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import Optional, List
from app.models.roadmap import Roadmap
from app.models.roadmap_step import RoadmapStep
import uuid

async def get_student_roadmap(db: AsyncSession, student_id: str) -> Optional[Roadmap]:
    """Retrieve a student's active roadmap with steps and milestones loaded."""
    result = await db.execute(
        select(Roadmap)
        .where(Roadmap.student_id == student_id, Roadmap.status == "active")
        .options(selectinload(Roadmap.steps), selectinload(Roadmap.milestones))
    )
    return result.scalar_one_or_none()

async def get_roadmap_by_id(db: AsyncSession, roadmap_id: str) -> Optional[Roadmap]:
    result = await db.execute(
        select(Roadmap)
        .where(Roadmap.id == roadmap_id)
        .options(selectinload(Roadmap.steps), selectinload(Roadmap.milestones))
    )
    return result.scalar_one_or_none()

async def create_roadmap(db: AsyncSession, student_id: str, title: str, career_path_id: Optional[str] = None) -> Roadmap:
    # Set any existing active roadmaps for this student to "completed" or "abandoned"
    existing = await db.execute(select(Roadmap).where(Roadmap.student_id == student_id, Roadmap.status == "active"))
    for rm in existing.scalars().all():
        rm.status = "completed"
        db.add(rm)
        
    roadmap = Roadmap(
        student_id=student_id,
        career_path_id=career_path_id,
        title=title,
        status="active",
        completion_percentage=0.0
    )
    db.add(roadmap)
    await db.commit()
    await db.refresh(roadmap)
    return roadmap

async def create_roadmap_step(
    db: AsyncSession,
    roadmap_id: str,
    title: str,
    description: Optional[str],
    step_order: int,
    skill_id: Optional[str] = None,
    difficulty: Optional[str] = None,
    estimated_hours: Optional[float] = None,
    resource_type: Optional[str] = None,
    resource_links: Optional[list] = None,
    is_mandatory: bool = True
) -> RoadmapStep:
    step = RoadmapStep(
        roadmap_id=roadmap_id,
        title=title,
        description=description,
        step_order=step_order,
        skill_id=skill_id,
        difficulty=difficulty,
        estimated_hours=estimated_hours,
        resource_type=resource_type,
        resource_links=resource_links,
        is_mandatory=is_mandatory,
        status="pending"
    )
    db.add(step)
    await db.commit()
    await db.refresh(step)
    return step

async def get_step(db: AsyncSession, step_id: str) -> Optional[RoadmapStep]:
    result = await db.execute(select(RoadmapStep).where(RoadmapStep.id == step_id))
    return result.scalar_one_or_none()

async def update_step_status(db: AsyncSession, step_id: str, status: str) -> Optional[RoadmapStep]:
    step = await get_step(db, step_id)
    if step:
        step.status = status
        db.add(step)
        await db.commit()
        await db.refresh(step)
        # Recalculate completion percentage for the roadmap
        await recalculate_completion(db, step.roadmap_id)
    return step

async def recalculate_completion(db: AsyncSession, roadmap_id: str) -> float:
    result = await db.execute(select(RoadmapStep).where(RoadmapStep.roadmap_id == roadmap_id))
    steps = result.scalars().all()
    if not steps:
        return 0.0
        
    completed_steps = [s for s in steps if s.status == "completed"]
    percentage = (len(completed_steps) / len(steps)) * 100.0
    
    roadmap_result = await db.execute(select(Roadmap).where(Roadmap.id == roadmap_id))
    roadmap = roadmap_result.scalar_one_or_none()
    if roadmap:
        roadmap.completion_percentage = percentage
        db.add(roadmap)
        await db.commit()
        
    return percentage
