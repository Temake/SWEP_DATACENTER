
from sqlmodel import Field, Relationship,SQLModel
from services.enums import Status
from services.enums import Tags
from sqlmodel import Field, SQLModel, Relationship,Column
from typing import Optional, List,TYPE_CHECKING
from datetime import datetime
from sqlalchemy import JSON

if TYPE_CHECKING:
    from .account import StudentAccount, SupervisorAccount


# class ProjectTagLink(SQLModel, table=True):
#     project_id: int = Field(foreign_key="project.id", primary_key=True)
#     tag_id: int = Field(foreign_key="tag.id", primary_key=True)


class Project(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(index=True, max_length=200)
    description: str
    year: int
    status: ProjectStatus = Field(default=ProjectStatus.PENDING)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    student_id: Optional[int] = Field(default=None, foreign_key="student.id")
    supervisor_id: Optional[int] = Field(default=None, foreign_key="supervisor.id")
    
    student: Optional[Student] = Relationship(back_populates="projects")
    supervisor: Optional[Supervisor] = Relationship(back_populates="projects")
    tags: List[Tag] = Relationship(back_populates="projects", link_model=ProjectTagLink)

    
# class Tag(SQLModel, table=True):
#     id: int = Field(default=None, primary_key=True)
#     name: str = Field(nullable=False, unique=True, index=True)

#     projects: List[Project] = Relationship(
#         back_populates="tags", link_model=ProjectTagLink
#     )
