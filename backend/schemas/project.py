from typing import List, Optional
from sqlmodel import SQLModel
from services.enums import Status,Tags


class ProjectCreate(SQLModel):
    title: str
    description: str
    year: str
    student_id: Optional[int] = None
    supervisor_id: Optional[int] = None
    file_url: Optional[str] = None
    tags: List[Tags] = []


class ProjectUpdate(SQLModel):
    title: Optional[str] = None
    year: Optional[str] = None
    description: Optional[str] = None
    file_url: Optional[str] = None
    tags: List[Tags] = []


class ProjectRead(SQLModel):
    id: int
    title: str
    description: str
    file_url: Optional[str] = None
    status: Status
    student_id: int
    supervisor_id: Optional[int] = None
    tags: List[Tags] = []
    
    
    class Config:
        from_attributes = True   