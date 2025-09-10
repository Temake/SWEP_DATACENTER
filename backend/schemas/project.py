from typing import List, Optional
from sqlmodel import SQLModel
from services.enums import Status


class ProjectCreate(SQLModel):
    title: str
    description: str
    file_url: Optional[str] = None
    student_id: int
    supervisor_id: Optional[int] = None
    tag_id: Optional[List[int]] = []


class ProjectUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    file_url: Optional[str] = None
    tag_id: Optional[List[int]] = None


class ProjectRead(SQLModel):
    id: int
    title: str
    description: str
    file_url: Optional[str] = None
    status: Status
    student_id: int
    supervisor_id: Optional[int] = None
    tags: List[str] = []
    
    
    class Config:
        from_attributes = True   