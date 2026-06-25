from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List
from app.models.digital_twin import DigitalTwin
from app.models.digital_twin_history import DigitalTwinHistory

async def get_digital_twin(db: AsyncSession, student_id: str) -> Optional[DigitalTwin]:
    result = await db.execute(select(DigitalTwin).where(DigitalTwin.student_id == student_id))
    return result.scalars().first()

async def save_digital_twin(db: AsyncSession, twin: DigitalTwin) -> DigitalTwin:
    db.add(twin)
    await db.commit()
    await db.refresh(twin)
    return twin

async def save_twin_history(db: AsyncSession, history: DigitalTwinHistory) -> DigitalTwinHistory:
    db.add(history)
    await db.commit()
    return history

async def get_twin_history(db: AsyncSession, student_id: str, limit: int = 10) -> List[DigitalTwinHistory]:
    """Fetch the last N historical snapshots for a student, newest first."""
    result = await db.execute(
        select(DigitalTwinHistory)
        .where(DigitalTwinHistory.student_id == student_id)
        .order_by(DigitalTwinHistory.created_at.desc())
        .limit(limit)
    )
    return list(result.scalars().all())

