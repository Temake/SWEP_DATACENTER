from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from typing import Annotated
from fastapi import HTTPException
from models.projects import *
from schemas.TagsSchema import ProjectRead
from models.account import *
from models.database import get_session
from services.enums import Status,Tags

routers=APIRouter()


@routers.get("/", response_model=list[Tags])
def list_tags(session: Session = Depends(get_session)):
    return [t.value for t in Tags]

@routers.post("/{project_id}/tags", response_model=ProjectRead)
def assign_tags_to_project(project_id: int, tags: list[Tags], session: Session = Depends(get_session)):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project.tags = list(set(project.tags + tags))

    session.add(project)
    session.commit()
    session.refresh(project)
    return project


@routers.get("/{project_id}/tags", response_model=list[Tags])
def list_project_tags(project_id: int, session: Session = Depends(get_session)):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project.tags


@routers.delete("/{project_id}/tags", response_model=ProjectRead)
def remove_tags_from_project(project_id: int, tags: list[Tags], session: Session = Depends(get_session)):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project.tags = [t for t in project.tags if t in tags]
    session.add(project)
    session.commit()
    session.refresh(project)
    return project

@routers.get("/project")
def serach_projects_by_tags(tags: list[Tags], session: Session = Depends(get_session)):
    statement = select(Project).where(
        Project.tags.contains(tags),
        Project.status == Status.APPROVED
    )
    projects = session.exec(statement).all()
    return projects 