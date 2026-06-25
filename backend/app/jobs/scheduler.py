from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.jobs.deadline_job import run_deadline_job
from app.jobs.intervention_job import run_intervention_job
from app.jobs.scholarship_job import run_scholarship_job
from app.jobs.opportunity_job import run_opportunity_job
from app.jobs.success_recomputation_job import run_daily_success_recomputation_job

def start_scheduler(scheduler: AsyncIOScheduler):
    # Run daily at 8 AM
    scheduler.add_job(run_deadline_job, 'cron', hour=8, minute=0)
    scheduler.add_job(run_intervention_job, 'cron', hour=8, minute=5)
    scheduler.add_job(run_scholarship_job, 'cron', hour=8, minute=10)
    scheduler.add_job(run_opportunity_job, 'cron', hour=8, minute=15)
    scheduler.add_job(run_daily_success_recomputation_job, 'cron', hour=8, minute=20)
