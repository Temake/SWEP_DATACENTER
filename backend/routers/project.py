from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from models.projects import Project
from schemas.project import ProjectCreate, ProjectRead, ProjectUpdate
from models.database import get_session
from services.enums import Status
from typing import List

routers= APIRouter(prefix="/projects", tags=["Projects"])

@routers.get("/", response_model=List[ProjectRead])
def list_projects(session: Session = Depends(get_session)):
    projects = session.exec(select(Project)).all()
    return projects


@routers.post("/", response_model=ProjectRead)
def create_project(
    project: ProjectCreate,
    session: Session = Depends(get_session)
):
    new_project = Project(
        title=project.title,
        description=project.description,
        year=project.year,
        file_url=project.file_url,
        status=Status.PENDING,
        student_id=project.student_id,
        tags=project.tags,
        supervisor_id=project.supervisor_id
    )
    session.add(new_project)
    session.commit()
    session.refresh(new_project)
    return new_project





@routers.patch("/{project_id}", response_model=Project)
def update_project(
    project_id: int,
    project_update: ProjectUpdate,
    session: Session = Depends(get_session)
):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project_data = project_update.model_dump(exclude_unset=True)
    project.sqlmodel_update(project_data)

    session.add(project)
    session.commit()
    session.refresh(project)
    return project


# Delete project
@routers.delete("/{project_id}")
def delete_project(project_id: int, session: Session = Depends(get_session)):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    session.delete(project)
    session.commit()
    return {"message": "Project deleted successfully"}


# Review project
@routers.put("/{project_id}/review", response_model=ProjectRead)
def review_project(
    project_id: int,
    status: Status,
    session: Session = Depends(get_session)
):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if status not in [Status.APPROVED, Status.REJECTED]:
        raise HTTPException(status_code=400, detail="Invalid review status")

    project.status = status
    session.add(project)
    session.commit()
    session.refresh(project)
    return project
