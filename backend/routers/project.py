from fastapi import APIRouter, Depends, HTTPException, Security
from fastapi.security import HTTPBearer
from sqlmodel import Session, select
from models.projects import Project
from models.account import StudentAccount
from schemas.project import ProjectCreate, ProjectRead, ProjectUpdate
from models.database import get_session
from services.enums import Status
from core.dependencies import (
    get_current_user, get_current_student, get_current_supervisor,
    require_supervisor_or_admin, require_student_or_supervisor, AccountType
)
from typing import List

routers= APIRouter(prefix="/projects", tags=["Projects"])
security = HTTPBearer()

@routers.get("/", response_model=List[ProjectRead])
def list_projects(
    session: Session = Depends(get_session),
    current_user: AccountType = Depends(get_current_user)
):
    if current_user.role.value == "Student":
        projects = session.exec(
            select(Project).where(Project.student_id == current_user.id)
        ).all()
    elif current_user.role.value == "Supervisor":
        projects = session.exec(
            select(Project).where(Project.supervisor_id == current_user.id)
        ).all()
    else:
        projects = session.exec(select(Project)).all()
    
    return projects


@routers.post("/", response_model=ProjectRead)
def create_project(
    project: ProjectCreate,
    session: Session = Depends(get_session),
    current_user: StudentAccount = Depends(get_current_student)
): 
    
    if current_user.role.value =="Supervisor" or current_user.role.value=="Admin":
        raise HTTPException(
            status_code=403, 
            detail="Students can only create projects for themselves"
        )
    
    new_project = Project(
        title=project.title,
        description=project.description,
        year=project.year,
        file_url=project.file_url,
        status=Status.PENDING,
        student_id=current_user.id,
        tags=project.tags,
        supervisor_id=project.supervisor_id
    )
    
    student = session.get(StudentAccount, new_project.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student Not Found")
    
    session.add(new_project)
    session.commit()
    session.refresh(new_project)
    return new_project

 
@routers.get("/{project_id}", response_model=ProjectRead)
def get_project(
    project_id: int,
    session: Session = Depends(get_session),
    current_user: AccountType = Depends(get_current_user)
):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if current_user.role.value == "Student" and project.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role.value == "Supervisor" and project.supervisor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return project



@routers.patch("/{project_id}", response_model=Project)
def update_project(
    project_id: int,
    project_update: ProjectUpdate,
    session: Session = Depends(get_session),
    current_user: AccountType = Depends(require_student_or_supervisor())
):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if current_user.role.value == "Student" and project.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Students can only update their own projects")
    elif current_user.role.value == "Supervisor" and project.supervisor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Supervisors can only update projects they supervise")

    project_data = project_update.model_dump(exclude_unset=True)
    project.sqlmodel_update(project_data)

    session.add(project)
    session.commit()
    session.refresh(project)
    return project


@routers.delete("/{project_id}")
def delete_project(
    project_id: int, 
    session: Session = Depends(get_session),
    current_user: AccountType = Depends(require_supervisor_or_admin())
):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if current_user.role.value == "Supervisor" and project.supervisor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Supervisors can only delete projects they supervise")

    session.delete(project)
    session.commit()
    return {"message": "Project deleted successfully"}


@routers.put("/{project_id}/review", response_model=ProjectRead)
def review_project(
    project_id: int,
    status: Status,
    session: Session = Depends(get_session),
    current_user: AccountType = Depends(require_supervisor_or_admin())
):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if status not in [Status.APPROVED, Status.REJECTED]:
        raise HTTPException(status_code=400, detail="Invalid review status")

    if current_user.role.value == "Supervisor" and project.supervisor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Supervisors can only review projects they supervise")

    project.status = status
    session.add(project)
    session.commit()
    session.refresh(project)
    return project


@routers.get("/my-projects", response_model=List[ProjectRead])
def get_my_projects(
    session: Session = Depends(get_session),
    current_user: StudentAccount = Depends(get_current_student)
):
    projects = session.exec(
        select(Project).where(Project.student_id == current_user.id)
    ).all()
    return projects


@routers.get("/supervised-projects", response_model=List[ProjectRead])
def get_supervised_projects(
    session: Session = Depends(get_session),
    current_user: AccountType = Depends(get_current_supervisor)
):
    projects = session.exec(
        select(Project).where(Project.supervisor_id == current_user.id)
    ).all()
    return projects
