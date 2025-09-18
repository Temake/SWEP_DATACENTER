from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlmodel import Session, select, func
from typing import Optional, List
from pydantic import BaseModel
from models.projects import Project
from models.account import StudentAccount, SupervisorAccount
from models.database import get_session
from services.enums import Status, Tags
from core.dependencies import (
    get_current_user, get_current_supervisor,
    require_supervisor_or_admin, AccountType
)
from sqlalchemy import or_

class UpdateProjectStatusRequest(BaseModel):
    status: Status
    review_comment: Optional[str] = None

supervisor_router = APIRouter(prefix="/supervisor", tags=["Supervisor"])

@supervisor_router.get("/projects")
async def get_supervised_projects(
    current_user: AccountType = Depends(get_current_supervisor),
    session: Session = Depends(get_session),
    status: Optional[Status] = Query(None, description="Filter by project status"),
    year: Optional[str] = Query(None, description="Filter by year"),
    tags: Optional[List[Tags]] = Query(None, description="Filter by tags"),
    page: Optional[int] = Query(1, description="Page number"),
    per_page: Optional[int] = Query(50, description="Items per page")
):
    """Get all projects supervised by the current supervisor"""
    
    # Build base query for projects supervised by current user
    statement = select(Project).where(Project.supervisor_id == current_user.id)
    
    # Apply filters
    if status:
        statement = statement.where(Project.status == status)
    
    if year:
        statement = statement.where(Project.year == year)
    
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
    
    # Convert to response format
    result = []
    for project in projects:
        # Get student info
        student = session.exec(
            select(StudentAccount).where(StudentAccount.id == project.student_id)
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
        
        result.append(project_data)
    
    return result

@supervisor_router.get("/students")
async def get_supervised_students(
    current_user: AccountType = Depends(get_current_supervisor),
    session: Session = Depends(get_session),
    department: Optional[str] = Query(None, description="Filter by department"),
    search: Optional[str] = Query(None, description="Search by name, email, or matric number"),
    page: Optional[int] = Query(1, description="Page number"),
    per_page: Optional[int] = Query(50, description="Items per page")
):
    """Get all students supervised by the current supervisor"""
    
    # Build base query for students supervised by current user
    statement = select(StudentAccount).where(StudentAccount.supervisor_id == current_user.id)
    
    # Apply filters
    if department:
        statement = statement.where(StudentAccount.department.ilike(f"%{department}%"))
    
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
    
    # Get project information for each student
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
            "year": getattr(student, 'year', ''),
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

@supervisor_router.patch("/projects/{project_id}/status")
async def update_project_status(
    project_id: int,
    request: UpdateProjectStatusRequest,
    current_user: AccountType = Depends(get_current_supervisor),
    session: Session = Depends(get_session)
):
    """Update the status of a project (approve/reject)"""
    
    # Get the project
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if the current supervisor is assigned to this project
    if project.supervisor_id != current_user.id:
        raise HTTPException(
            status_code=403, 
            detail="You can only update status of projects assigned to you"
        )
    
    # Update project status
    project.status = request.status
    
    # If there's a review comment, you might want to store it in a separate field
    # For now, we'll assume the project model doesn't have this field
    # You can add a review_comment field to the Project model if needed
    
    session.add(project)
    session.commit()
    session.refresh(project)
    
    return project

@supervisor_router.get("/dashboard/stats")
async def get_supervisor_dashboard_stats(
    current_user: AccountType = Depends(get_current_supervisor),
    session: Session = Depends(get_session)
):
    """Get supervisor dashboard statistics"""
    
    # Count total students supervised
    total_students = session.exec(
        select(func.count(StudentAccount.id)).where(StudentAccount.supervisor_id == current_user.id)
    ).first()
    
    # Count total projects supervised
    total_projects = session.exec(
        select(func.count(Project.id)).where(Project.supervisor_id == current_user.id)
    ).first()
    
    # Count projects by status
    pending_projects = session.exec(
        select(func.count(Project.id)).where(
            Project.supervisor_id == current_user.id,
            Project.status == Status.PENDING
        )
    ).first()
    
    approved_projects = session.exec(
        select(func.count(Project.id)).where(
            Project.supervisor_id == current_user.id,
            Project.status == Status.APPROVED
        )
    ).first()
    
    rejected_projects = session.exec(
        select(func.count(Project.id)).where(
            Project.supervisor_id == current_user.id,
            Project.status == Status.REJECTED
        )
    ).first()
    
    # Count recent submissions (projects created in the last 30 days)
    from datetime import datetime, timedelta
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_submissions = session.exec(
        select(func.count(Project.id)).where(
            Project.supervisor_id == current_user.id,
            Project.created_at >= thirty_days_ago
        )
    ).first()
    
    return {
        "total_students": total_students or 0,
        "total_projects": total_projects or 0,
        "pending_projects": pending_projects or 0,
        "approved_projects": approved_projects or 0,
        "rejected_projects": rejected_projects or 0,
        "recent_submissions": recent_submissions or 0
    }