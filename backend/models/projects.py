from sqlmodel import Field, Relationship, SQLModel, JSON
from services.enums import Status
from services.enums import Tags
from sqlmodel import Field, SQLModel, Relationship, Column
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime

if TYPE_CHECKING:
    from .account import StudentAccount, SupervisorAccount


# class ProjectTagLink(SQLModel, table=True):
#     project_id: int = Field(foreign_key="project.id", primary_key=True)
#     tag_id: int = Field(foreign_key="tag.id", primary_key=True)


class Project(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    title: str = Field(nullable=False, index=True)
    description: str = Field(nullable=False)
    file_url: Optional[str] = Field(default=None)
    status: Status = Field(default=Status.PENDING)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    student_id: int = Field(foreign_key="studentaccount.id", nullable=False)
    supervisor_id: Optional[int] = Field(default=None, foreign_key="supervisoraccount.id")

    student: "StudentAccount" = Relationship(back_populates="projects")
    supervisor: Optional["SupervisorAccount"] = Relationship(back_populates="supervised_projects")
    
    tags: List[Tags] = Field(default=[], sa_column=Column(JSON))
# class Tag(SQLModel, table=True):
#     id: int = Field(default=None, primary_key=True)
#     name: str = Field(nullable=False, unique=True, index=True)

#     projects: List[Project] = Relationship(
#         back_populates="tags", link_model=ProjectTagLink
#     )