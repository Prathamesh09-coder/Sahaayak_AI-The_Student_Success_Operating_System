import asyncio
from app.workers.celery_worker import celery_app
from app.db.session import AsyncSessionLocal
from app.services import digital_twin_service
import logging

logger = logging.getLogger(__name__)

@celery_app.task(bind=True, max_retries=3, default_retry_delay=10)
def generate_digital_twin_task(self, student_id: str):
    """Celery task to generate or recalculate the Digital Twin for a student."""
    try:
        try:
            loop = asyncio.get_running_loop()
            # If a loop is already running (e.g. mock celery), run as a background task
            loop.create_task(_run_generation(student_id))
        except RuntimeError:
            # No running loop (e.g. real celery worker thread)
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                loop.run_until_complete(_run_generation(student_id))
            finally:
                loop.close()
    except Exception as exc:
        logger.error(f"[TwinTask] Failed for student {student_id}: {exc}")
        raise self.retry(exc=exc)

async def _run_generation(student_id: str):
    async with AsyncSessionLocal() as db:
        twin = await digital_twin_service.generate_digital_twin(db, student_id)
        logger.info(f"[TwinTask] Digital Twin generated for student {student_id} — success_score={twin.success_score}")
