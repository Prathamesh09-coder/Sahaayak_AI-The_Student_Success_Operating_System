from sqlalchemy.ext.asyncio import AsyncSession
from app.models.student_activity import StudentActivity
from app.core.redis import redis_client
import uuid

class ActivityService:
    async def log_activity(
        self,
        db: AsyncSession,
        student_id: str,
        activity_type: str,
        activity_description: str
    ):
        activity = StudentActivity(
            student_id=student_id,
            activity_type=activity_type,
            activity_description=activity_description
        )
        db.add(activity)
        await db.commit()
        await db.refresh(activity)

        # Invalidate dashboard cache
        cache_key = f"dashboard:{student_id}"
        try:
            await redis_client.delete(cache_key)
        except Exception:
            pass
        
        return activity

activity_service = ActivityService()
