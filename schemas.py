from pydantic import BaseModel
from typing import List, Optional


# --- Tag ---
class TagBase(BaseModel):
    tag_name: str

class TagCreate(TagBase):
    pass

class Tag(TagBase):
    tag_id: int
    class Config:
        orm_mode = True


# --- Student ---
class StudentBase(BaseModel):
    name: str
    email: str
    department: int
    level: str

class StudentCreate(StudentBase):
    pass

class Student(StudentBase):
    student_id: int
    class Config:
        orm_mode = True


# --- Supervisor ---
class SupervisorBase(BaseModel):
    name: str
    email: str
    department: int

class SupervisorCreate(SupervisorBase):
    pass

class Supervisor(SupervisorBase):
    supervisor_id: int
    class Config:
        orm_mode = True


# --- Department ---
class DepartmentBase(BaseModel):
    dept_name: str
    faculty: str

class DepartmentCreate(DepartmentBase):
    pass

class Department(DepartmentBase):
    dept_id: int
    class Config:
        orm_mode = True


# --- Project ---
class ProjectBase(BaseModel):
    title: str
    description: str
    year: str
    student_id: int
    supervisor_id: int

class ProjectCreate(ProjectBase):
    tag_ids: Optional[List[int]] = []

class Project(ProjectBase):
    project_id: int
    tags: List[Tag] = []
    class Config:
        orm_mode = True
