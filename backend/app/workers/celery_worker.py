from celery import Celery
import os
from app.core.config import settings

# In docker, REDIS_URL will come from environment variables.
# For local dev fallback, we use default localhost.
redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")

celery_app = Celery(
    "worker",
    broker=redis_url,
    backend=redis_url
)

celery_app.conf.task_routes = {
    "app.workers.celery_worker.test_task": "main-queue"
}

@celery_app.task(acks_late=True)
def test_task(word: str) -> str:
    return f"Test task executed with word: {word}"
