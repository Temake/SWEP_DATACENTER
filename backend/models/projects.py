from sqlmodel import Field, Relationship, SQLModel
from sqlalchemy import JSON
from services.enums import Status
from services.enums import Tags
from sqlmodel import Field, SQLModel, Relationship, Column
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime,timezone


if TYPE_CHECKING:
    from .account import StudentAccount, SupervisorAccount



class Project(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(index=True, max_length=200)
    year: str = Field(index=True,nullable=False)
    description: str = Field(nullable=False)
    file_url: Optional[str] = Field(default=None)
    document_url: Optional[str] = Field(default=None)
    status: Status = Field(default=Status.PENDING)
    review_comment: Optional[str] = Field(default=None,nullable=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)
    supervisor: Optional["SupervisorAccount"] = Relationship(back_populates="supervised_projects")
    student_id: int = Field(foreign_key="studentaccount.id", nullable=False)
    supervisor_id: Optional[int] = Field(default=None, foreign_key="supervisoraccount.id")
    student: Optional["StudentAccount"] = Relationship(back_populates="projects")
    tags: List[Tags] = Field(default=[], sa_column=Column(JSON))
   
    
