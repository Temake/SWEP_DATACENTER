from pydantic import BaseModel
from typing import List, Optional



class TagCreate(BaseModel):
    tag_name: str


from typing import List, Optional
from sqlmodel import SQLModel
from services.enums import Status


class ProjectCreate(SQLModel):
    title: str
    description: str
    file_url: Optional[str] = None
    student_id: int
    supervisor_id: Optional[int] = None
    tag_ids: Optional[List[int]] = []


class ProjectRead(SQLModel):
    id: int
    title: str
    description: str
    file_url: Optional[str] = None
    status: Status
    student_id: int
    supervisor_id: Optional[int] = None
    tags: List[str] = []


class TagCreate(SQLModel):
    name: str


class TagRead(SQLModel):
    id: int
    name: str


class TagUpdate(SQLModel):
    name: Optional[str] = None