from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from typing import Annotated
from fastapi import HTTPException
from models.projects import *
from schemas.project import ProjectRead
from models.account import *
from core.dependencies import AccountType, get_current_user
from models.database import get_session
from services.enums import Status, Tags

routers = APIRouter()


@routers.get("/", response_model=list[Tags])
def list_tags(session: Session = Depends(get_session)):
    return [t.value for t in Tags]



@routers.get("/{project_id}/tags", response_model=list[Tags])
def list_project_tags(project_id: int, session: Session = Depends(get_session)):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project.tags


@routers.delete("/{project_id}/tags", response_model=ProjectRead)
def remove_tags_from_project(project_id: int, tags: list[Tags], session: Session = Depends(get_session),current_user:AccountType = Depends(get_current_user)):
    project = session.get(Project, project_id)
    if current_user.role.value == "Supervisor" and current_user.id != project.supervisor_id:
        raise HTTPException(status_code=403,detail= "Supervisor can only Upadate the Project they Supervise")
    if current_user.id != project.student_id:
        raise HTTPException(status_code=403,detail="Access Denied")
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project.tags = [t for t in project.tags if t not in tags]
    session.add(project)
    session.commit()
    session.refresh(project)
    return project



@routers.post("/search", response_model=List[ProjectRead])
def search_projects_by_tags(
    tags: List[str] = [],
    name: str = "",
    title: str = "",
    matric_no: str = "",
    student_name: str = "",
    session: Session = Depends(get_session),
    current_user: AccountType = Depends(get_current_user)
):
    statement = select(Project).where(
        Project.tags.contains(tags),
        Project.status == Status.APPROVED
    )

    if title:
        statement = statement.where(Project.title.contains(title))
    
    if name:
        statement = statement.join(StudentAccount).where(StudentAccount.name.contains(name))
    
    if matric_no:
        statement = statement.join(StudentAccount).where(StudentAccount.matric_no.contains(matric_no))
    
    if student_name:
        statement = statement.join(StudentAccount).where(StudentAccount.name.contains(student_name))

    projects = session.exec(statement).all()
    return projects
