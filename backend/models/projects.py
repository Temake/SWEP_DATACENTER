
from sqlmodel import Field, Relationship,SQLModel
from services.enums import Status
from .account import *
from services.enums import Tags
from enum import Enum
from sqlmodel import Field, SQLModel, Relationship,Column
from typing import Optional, List
from datetime import datetime

class ProjectStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class Department(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, max_length=100)
    faculty: str = Field(max_length=100)
    
    students: List["Student"] = Relationship(back_populates="department")
    supervisors: List["Supervisor"] = Relationship(back_populates="department")

class Student(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, max_length=100)
    email: str = Field(unique=True, index=True, max_length=100)
    level: str = Field(max_length=10)
    department_id: Optional[int] = Field(default=None, foreign_key="department.id")
    
    department: Optional[Department] = Relationship(back_populates="students")
    projects: List["Project"] = Relationship(back_populates="student")

class Supervisor(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, max_length=100)
    email: str = Field(unique=True, index=True, max_length=100)
    department_id: Optional[int] = Field(default=None, foreign_key="department.id")
    
    department: Optional[Department] = Relationship(back_populates="supervisors")
    projects: List["Project"] = Relationship(back_populates="supervisor")

class ProjectTagLink(SQLModel, table=True):
    project_id: Optional[int] = Field(default=None, foreign_key="project.id", primary_key=True)
    tag_id: Optional[int] = Field(default=None, foreign_key="tag.id", primary_key=True)

class Tag(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True, max_length=50)
    
    projects: List["Project"] = Relationship(back_populates="tags", link_model=ProjectTagLink)

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
