import logging
from app.db.session import AsyncSessionLocal
from app.services.success_index_service import success_index_service
from app.models.student_profile import StudentProfile
from sqlalchemy import select

logger = logging.getLogger(__name__)

async def run_daily_success_recomputation_job():
    """Daily background job to recalculate success indices, risks, and forecasts for all students."""
    logger.info("Running daily success metrics re-computation job...")
    async with AsyncSessionLocal() as db:
        try:
            result = await db.execute(select(StudentProfile.id))
            student_ids = result.scalars().all()
            logger.info(f"Found {len(student_ids)} student profiles to recompute.")
            
            for student_id in student_ids:
                try:
                    await success_index_service.recalculate_student_success_metrics(db, student_id)
                except Exception as e:
                    logger.error(f"Failed to recompute success metrics for student {student_id}: {e}", exc_info=True)
        except Exception as e:
            logger.error(f"Error during daily success recomputation job: {e}", exc_info=True)
