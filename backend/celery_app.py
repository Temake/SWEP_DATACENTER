from celery import Celery
from celery.schedules import crontab
from config import config
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create Celery app
celery_app = Celery(
    "sweps_backend",
    broker=config.CELERY_BROKER_URL,
    backend=config.CELERY_RESULT_BACKEND,
    include=["tasks.project_cleanup"]
)

# Configure Celery
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    
    # Beat schedule - run cleanup task every 24 hours at 2 AM UTC
    beat_schedule={
        "cleanup-pending-projects": {
            "task": "tasks.project_cleanup.cleanup_pending_projects",
            "schedule": crontab(hour=2, minute=0),  # Run at 2:00 AM UTC daily
        },
    },
    
    # Task routing
    task_routes={
        "tasks.project_cleanup.*": {"queue": "cleanup"},
    },
    
    # Worker settings
    worker_prefetch_multiplier=1,
    task_acks_late=True,
    worker_max_tasks_per_child=1000,
)

# Optional: Add task failure handling
@celery_app.task(bind=True)
def debug_task(self):
    logger.info(f"Request: {self.request!r}")

if __name__ == "__main__":
    celery_app.start()