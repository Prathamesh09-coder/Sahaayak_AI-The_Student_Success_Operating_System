import logging
from app.services.no_student_left_behind import no_student_left_behind_engine

logger = logging.getLogger(__name__)

async def run_intervention_job():
    logger.info("Running daily intervention job (No Student Left Behind Engine)...")
    await no_student_left_behind_engine.run_daily_checks()
