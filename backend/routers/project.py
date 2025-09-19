from fastapi import APIRouter, Depends, HTTPException, Security, Query
from fastapi.security import HTTPBearer
from sqlmodel import Session, select
from typing import Optional, List
from cloudinary.uploader import upload as cloudinary_upload
from models.projects import Project
from services.cloudinary import upload_file_to_cloudinary
from models.account import StudentAccount
from schemas.project import ProjectCreate, ProjectRead, ProjectUpdate, ProjectCreateForm, ProjectUpdateForm, ProjectReviewRequest
from models.database import get_session
from services.enums import Status, Tags
from core.dependencies import (
    get_current_user, get_current_student, get_current_supervisor,
    require_supervisor_or_admin, require_student_or_supervisor, AccountType
)
from sqlalchemy import or_

routers = APIRouter(prefix="/projects", tags=["Projects"])
security = HTTPBearer()


@routers.get("/", response_model=List[ProjectRead])
async def list_my_projects(
    session: Session = Depends(get_session),
    current_user: AccountType = Depends(get_current_user),
    year: Optional[str] = None,
    tags: Optional[List[Tags]] = Query(
        None, description="Filter by one or more tags"),
    match_all: bool = Query(
        False, description="If true, require all tags to match; otherwise any")
):
    if current_user.role.value == "Student":
        statement = select(Project).where(
            Project.student_id == current_user.id)
    elif current_user.role.value == "Supervisor":
        statement = select(Project).where(
            Project.supervisor_id == current_user.id)
    else:
        statement = select(Project)

    if year:
        statement = statement.where(Project.year == year)

    if tags:
        tag_values = [t.value for t in tags]
        if match_all:
            statement = statement.where(Project.tags.contains(tag_values))
        else:
            ors = [Project.tags.contains([tv]) for tv in tag_values]
            if ors:
                statement = statement.where(or_(*ors))

    projects = session.exec(statement).all()
    return projects


@routers.post("/", response_model=ProjectRead)
async def create_project(
    project_form: ProjectCreateForm = Depends(),
    session: Session = Depends(get_session),
    current_user: StudentAccount = Depends(get_current_student)
):

    if current_user.role.value == "Supervisor" or current_user.role.value == "Admin":
        raise HTTPException(
            status_code=403,
            detail="Students can only create projects for themselves"
        )

    document_url = None
    if project_form.document and project_form.document is not None:
        document_url = await upload_file_to_cloudinary(project_form.document)

    new_project = Project(
        title=project_form.title,
        description=project_form.description,
        year=project_form.year,
        file_url=project_form.file_url,
        status=Status.PENDING,
        student_id=current_user.id,
        tags=project_form.tags,
        supervisor_id=project_form.supervisor_id,
        document_url=document_url
    )

    student = session.get(StudentAccount, new_project.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student Not Found")

    session.add(new_project)
    session.commit()
    session.refresh(new_project)
    return new_project


@routers.get("/all", response_model=List[ProjectRead])
async def get_all_project(
    session: Session = Depends(get_session),
    current_user: AccountType = Depends(get_current_user),
    year: Optional[str] = None,
    tags: Optional[List[Tags]] = Query(
        None, description="Filter by one or more tags"),
    match_all: bool = Query(
        False, description="If true, require all tags to match; otherwise any"),
    status: Optional[Status] = None,
):
    statement = select(Project)

    if year:
        statement = statement.where(Project.year == year)

    if status:
        statement = statement.where(Project.status == status)

    if tags:
        tag_values = [t.value for t in tags]
        if match_all:
            statement = statement.where(Project.tags.contains(tag_values))
        else:
            ors = [Project.tags.contains([tv]) for tv in tag_values]
            if ors:
                statement = statement.where(or_(*ors))

    projects = await session.exec(statement).all()
    return projects


@routers.get("/supervised-projects", response_model=List[ProjectRead])
async def get_supervised_projects(
    session: Session = Depends(get_session),
    current_user: AccountType = Depends(get_current_supervisor)
):
    if current_user.role.value != "Supervisor":
        raise HTTPException(status_code=403, detail="Access denied")

    projects = await session.exec(
        select(Project).where(Project.supervisor_id == current_user.id)
    ).all()
    return projects


@routers.get("/{project_id}", response_model=ProjectRead)
def get_project(
    project_id: int,
    session: Session = Depends(get_session),
    current_user: AccountType = Depends(get_current_user)
):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return project


@routers.patch("/{student_id}/assign-supervisor")
def assign_supervisor_to_project(
    student_id: int,
    supervisor_id: int = Query(...,
                               description="ID of the supervisor to assign"),
    session: Session = Depends(get_session),
    current_user: AccountType = Depends(require_supervisor_or_admin())
):
    student = session.get(StudentAccount, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    from models.account import SupervisorAccount
    supervisor = session.get(SupervisorAccount, supervisor_id)
    if not supervisor:
        raise HTTPException(status_code=404, detail="Supervisor not found")

    if current_user.role.value == "Supervisor" and current_user.id != supervisor_id:
        raise HTTPException(
            status_code=403, detail="Supervisors can only assign themselves to students")

    student.supervisor_id = supervisor_id
    session.add(student)
    session.commit()
    session.refresh(student)
    return student


@routers.patch("/{project_id}", response_model=Project)
async def update_project(
    project_id: int,
    project_form: ProjectUpdateForm = Depends(),
    session: Session = Depends(get_session),
    current_user: AccountType = Depends(require_student_or_supervisor())
):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if current_user.role.value == "Student" and project.student_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Students can only update their own projects")
    elif current_user.role.value == "Supervisor" and project.supervisor_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Supervisors can only update projects they supervise")

    if project_form.document:
        document_url = await upload_file_to_cloudinary(project_form.document)
        project.document_url = document_url

    if project_form.tags is not None:
        project.tags = project_form.tags

    if project_form.title is not None:
        project.title = project_form.title
    if project_form.description is not None:
        project.description = project_form.description
    if project_form.year is not None:
        project.year = project_form.year
    if project_form.file_url is not None:
        project.file_url = project_form.file_url

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
        raise HTTPException(
            status_code=403, detail="Supervisors can only delete projects they supervise")

    session.delete(project)
    session.commit()
    return {"message": "Project deleted successfully"}


@routers.put("/{project_id}/review", response_model=ProjectRead)
def review_project(
    project_id: int,
    review_data: ProjectReviewRequest,
    session: Session = Depends(get_session),
    current_user: AccountType = Depends(require_supervisor_or_admin())
):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if review_data.status not in [Status.APPROVED, Status.REJECTED]:
        raise HTTPException(status_code=400, detail="Invalid review status")

    if current_user.role.value == "Supervisor" and project.supervisor_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Supervisors can only review projects they supervise")

    project.status = review_data.status
    project.review_comment = review_data.review_comment
    session.add(project)
    session.commit()
    session.refresh(project)
    return project
