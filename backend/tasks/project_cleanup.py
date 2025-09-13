from celery import Celery
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
import logging
from typing import List
from models.projects import Project
from models.account import StudentAccount, SupervisorAccount
from models.database import get_session
from services.cloudinary import delete_file_from_cloudinary
from services.enums import Status
from config import config


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


celery_app = Celery(
    "Scholar Base",
    broker=config.CELERY_BROKER_URL,
    backend=config.CELERY_RESULT_BACKEND
)


engine = create_engine(config.DATABASE_URL)


@celery_app.task(bind=True, name="tasks.project_cleanup.cleanup_pending_projects")
def cleanup_pending_projects(self):
    try:
        logger.info("Starting cleanup of pending projects...")
        
  
        cutoff_date = datetime.now(timezone.utc) - timedelta(hours=1)
        logger.info(f"Looking for pending projects created before: {cutoff_date}")
        

        with Session(engine) as db:
            pending_projects = db.query(Project).filter(
                Project.status == Status.PENDING,
                Project.created_at <= cutoff_date,
                Project.document_url.isnot(None)  # Only projects with documents
            ).all()
            
            if not pending_projects:
                logger.info("No pending projects found for cleanup")
                return {
                    "status": "success",
                    "message": "No projects to clean up",
                    "projects_processed": 0,
                    "documents_deleted": 0
                }
            
            logger.info(f"Found {len(pending_projects)} pending projects for cleanup")
            
            processed_count = 0
            deleted_count = 0
            failed_deletions = []
            
            for project in pending_projects:
                try:
                    processed_count += 1
                    document_url = project.document_url
                    
                    logger.info(f"Processing project {project.id} - {project.title}")
                    
                   
                    if document_url:
                        deletion_success = delete_file_from_cloudinary(document_url)
                        
                        if deletion_success:
                            project.document_url = None
                            project.updated_at = datetime.now(timezone.utc)
                            
                            deleted_count += 1
                            logger.info(f"Successfully deleted document for project {project.id}")
                            
                            # Log the cleanup action
                            logger.info(
                                f"CLEANUP ACTION: Project ID: {project.id}, "
                                f"Title: {project.title}, "
                                f"Student ID: {project.student_id}, "
                                f"Document deleted from Cloudinary: {document_url}, "
                                f"Created at: {project.created_at}"
                            )
                        else:
                            failed_deletions.append({
                                "project_id": project.id,
                                "title": project.title,
                                "document_url": document_url
                            })
                            logger.warning(f"Failed to delete document from Cloudinary for project {project.id}")
                    
                except Exception as e:
                    logger.error(f"Error processing project {project.id}: {str(e)}")
                    failed_deletions.append({
                        "project_id": project.id,
                        "title": project.title,
                        "error": str(e)
                    })
            
            db.commit()
            
            # Prepare result summary
            result = {
                "status": "success",
                "message": f"Cleanup completed. Processed {processed_count} projects, deleted {deleted_count} documents",
                "projects_processed": processed_count,
                "documents_deleted": deleted_count,
                "failed_deletions": failed_deletions,
                "cutoff_date": cutoff_date.isoformat()
            }
            
            logger.info(f"Cleanup task completed: {result['message']}")
            
            if failed_deletions:
                logger.warning(f"Failed to delete {len(failed_deletions)} documents")
                for failure in failed_deletions:
                    logger.warning(f"Failed deletion: {failure}")
            
            return result
            
    except Exception as e:
        error_msg = f"Cleanup task failed with error: {str(e)}"
        logger.error(error_msg, exc_info=True)
        
        # Retry the task up to 3 times with exponential backoff
        if self.request.retries < 3:
            logger.info(f"Retrying cleanup task (attempt {self.request.retries + 1}/3)")
            raise self.retry(countdown=60 * (2 ** self.request.retries), max_retries=3)
        
        return {
            "status": "error",
            "message": error_msg,
            "projects_processed": 0,
            "documents_deleted": 0
        }

