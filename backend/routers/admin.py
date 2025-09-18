
from fastapi import APIRouter,Depends, HTTPException, Security, Query
from fastapi.security import HTTPBearer
from sqlmodel import Session, select, func
from typing import Optional, List
from cloudinary.uploader import upload as cloudinary_upload
from models.projects import Project
from services.cloudinary import upload_file_to_cloudinary
from models.account import StudentAccount, SupervisorAccount
from schemas.project import ProjectCreate, ProjectRead, ProjectUpdate, ProjectCreateForm, ProjectUpdateForm
from models.database import get_session
from services.enums import Status, Tags
from core.dependencies import (
    get_current_user, get_current_student, get_current_supervisor,
    require_supervisor_or_admin, require_student_or_supervisor, AccountType
)
from sqlalchemy import or_


admin=APIRouter(prefix="/admin", tags=["Admin"])

@admin.get("/dashboard/stats")
async def get_dashboard_stats(
    current_user: AccountType = Depends(require_supervisor_or_admin),
    session: Session = Depends(get_session)
):
    """Get admin dashboard statistics"""
    
    # Count total projects
    total_projects = session.exec(select(func.count(Project.id))).first()
    
    # Count projects by status
    pending_projects = session.exec(
        select(func.count(Project.id)).where(Project.status == Status.PENDING)
    ).first()
    
    approved_projects = session.exec(
        select(func.count(Project.id)).where(Project.status == Status.APPROVED)
    ).first()
    
    rejected_projects = session.exec(
        select(func.count(Project.id)).where(Project.status == Status.REJECTED)
    ).first()
    
    # Count total students and supervisors
    total_students = session.exec(select(func.count(StudentAccount.id))).first()
    total_supervisors = session.exec(select(func.count(SupervisorAccount.id))).first()
    
    return {
        "total_projects": total_projects or 0,
        "pending_projects": pending_projects or 0,
        "approved_projects": approved_projects or 0,
        "rejected_projects": rejected_projects or 0,
        "total_students": total_students or 0,
        "total_supervisors": total_supervisors or 0
    }

@admin.get("/students")
async def get_all_students(
    current_user: AccountType = Depends(require_supervisor_or_admin),
    session: Session = Depends(get_session),
    department: Optional[str] = Query(None, description="Filter by department"),
    year: Optional[str] = Query(None, description="Filter by year"),
    supervisor_id: Optional[int] = Query(None, description="Filter by supervisor"),
    search: Optional[str] = Query(None, description="Search by name, email, or matric number"),
    page: Optional[int] = Query(1, description="Page number"),
    per_page: Optional[int] = Query(50, description="Items per page")
):
    """Get all students with optional filtering and pagination"""
    
    # Build base query
    statement = select(StudentAccount)
    
    # Apply filters
    if department:
        statement = statement.where(StudentAccount.department.ilike(f"%{department}%"))
    
    if supervisor_id:
        statement = statement.where(StudentAccount.supervisor_id == supervisor_id)
    
    if search:
        search_filter = or_(
            StudentAccount.name.ilike(f"%{search}%"),
            StudentAccount.email.ilike(f"%{search}%"),
            StudentAccount.matric_no.ilike(f"%{search}%")
        )
        statement = statement.where(search_filter)
    
    # Apply pagination
    offset = (page - 1) * per_page
    statement = statement.offset(offset).limit(per_page)
    
    students = session.exec(statement).all()
    
    # Get project counts for each student
    result = []
    for student in students:
        project_count = session.exec(
            select(func.count(Project.id)).where(Project.student_id == student.id)
        ).first()
        
        # Get latest project
        latest_project = session.exec(
            select(Project)
            .where(Project.student_id == student.id)
            .order_by(Project.created_at.desc())
            .limit(1)
        ).first()
        
        student_data = {
            "id": student.id,
            "name": student.name,
            "email": student.email,
            "matric_no": student.matric_no,
            "year": getattr(student, 'year', ''),  # Add year if it exists in your model
            "department": student.department,
            "role": student.role,
            "supervisor_id": student.supervisor_id,
            "created_at": student.created_at.isoformat(),
            "updated_at": getattr(student, 'updated_at', student.created_at).isoformat(),
            "project_count": project_count or 0
        }
        
        if latest_project:
            student_data["latest_project"] = {
                "id": latest_project.id,
                "title": latest_project.title,
                "status": latest_project.status.value,
                "created_at": latest_project.created_at.isoformat()
            }
        
        result.append(student_data)
    
    return result

@admin.get("/projects")
async def get_all_projects(
    current_user: AccountType = Depends(require_supervisor_or_admin),
    session: Session = Depends(get_session),
    status: Optional[Status] = Query(None, description="Filter by project status"),
    year: Optional[str] = Query(None, description="Filter by year"),
    supervisor_id: Optional[int] = Query(None, description="Filter by supervisor"),
    student_id: Optional[int] = Query(None, description="Filter by student"),
    search: Optional[str] = Query(None, description="Search by title or description"),
    tags: Optional[List[Tags]] = Query(None, description="Filter by tags"),
    page: Optional[int] = Query(1, description="Page number"),
    per_page: Optional[int] = Query(50, description="Items per page")
):
    """Get all projects with optional filtering and pagination"""
    
    # Build base query
    statement = select(Project)
    
    # Apply filters
    if status:
        statement = statement.where(Project.status == status)
    
    if year:
        statement = statement.where(Project.year == year)
    
    if supervisor_id:
        statement = statement.where(Project.supervisor_id == supervisor_id)
    
    if student_id:
        statement = statement.where(Project.student_id == student_id)
    
    if search:
        search_filter = or_(
            Project.title.ilike(f"%{search}%"),
            Project.description.ilike(f"%{search}%")
        )
        statement = statement.where(search_filter)
    
    if tags:
        tag_values = [tag.value for tag in tags]
        for tag_value in tag_values:
            statement = statement.where(Project.tags.contains([tag_value]))
    
    # Apply pagination
    offset = (page - 1) * per_page
    statement = statement.offset(offset).limit(per_page)
    
    # Order by creation date (newest first)
    statement = statement.order_by(Project.created_at.desc())
    
    projects = session.exec(statement).all()
    
    # Convert to response format with student and supervisor info
    result = []
    for project in projects:
        # Get student info
        student = session.exec(
            select(StudentAccount).where(StudentAccount.id == project.student_id)
        ).first()
        
        # Get supervisor info
        supervisor = None
        if project.supervisor_id:
            supervisor = session.exec(
                select(SupervisorAccount).where(SupervisorAccount.id == project.supervisor_id)
            ).first()
        
        project_data = {
            "id": project.id,
            "title": project.title,
            "year": project.year,
            "description": project.description,
            "file_url": project.file_url,
            "document_url": project.document_url,
            "status": project.status,
            "created_at": project.created_at,
            "updated_at": project.updated_at,
            "student_id": project.student_id,
            "supervisor_id": project.supervisor_id,
            "tags": project.tags,
        }
        
        if student:
            project_data["student"] = {
                "id": student.id,
                "name": student.name,
                "email": student.email,
                "matric_no": student.matric_no,
                "department": student.department,
                "role": student.role
            }
        
        if supervisor:
            project_data["supervisor"] = {
                "id": supervisor.id,
                "name": supervisor.name,
                "email": supervisor.email,
                "department": supervisor.department,
                "role": supervisor.role,
                "faculty": supervisor.faculty,
                "title": supervisor.title
            }
        
        result.append(project_data)
    
    return result
    