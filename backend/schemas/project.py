from typing import List, Optional
from fastapi import Form, File, UploadFile
from sqlmodel import SQLModel
from services.enums import Status, Tags
import json


class ProjectCreate(SQLModel):
    title: str
    description: str
    year: str
    student_id: Optional[int] = None
    supervisor_id: Optional[int] = None
    file_url: Optional[str] = None
    document_url: Optional[str] = None
    tags: List[Tags] = []


class ProjectUpdate(SQLModel):
    title: Optional[str] = None
    year: Optional[str] = None
    description: Optional[str] = None
    file_url: Optional[str] = None
    document_url: Optional[str] = None
    tags: List[Tags] = []


class ProjectCreateForm:
    def __init__(
        self,
        title: str = Form(...),
        description: str = Form(...),
        year: str = Form(...),
        supervisor_id: Optional[int] = Form(None),
        file_url: Optional[str] = Form(None),
        tags: List[Tags] = Form([]),
        document: Optional[UploadFile] = File(None)
    ):
        self.title = title
        self.description = description
        self.year = year
        self.supervisor_id = supervisor_id
        self.file_url = file_url
        self.document = None
        self.tags = tags
        if document is not None:
            if (hasattr(document, 'filename') and 
                document.filename and 
                document.filename.strip() != "" and
                hasattr(document, 'content_type')):
                self.document = document
       

class ProjectUpdateForm:
    def __init__(
        self,
        title: Optional[str] = Form(None),
        description: Optional[str] = Form(None),
        year: Optional[str] = Form(None),
        file_url: Optional[str] = Form(None),
        tags: Optional[str] = Form(None),  
        document: Optional[UploadFile] = File(None)
    ):
        self.title = title
        self.description = description
        self.year = year
        self.file_url = file_url
        self.document = None
        if document is not None:
            if (hasattr(document, 'filename') and 
                document.filename and 
                document.filename.strip() != "" and
                hasattr(document, 'content_type')):
                self.document = document
    
        if tags is not None:
            try:
                parsed_tags = json.loads(tags)
                self.tags = [Tags(tag) for tag in parsed_tags if tag in [t.value for t in Tags]]
            except (json.JSONDecodeError, ValueError):
                self.tags = None
        else:
            self.tags = None


class ProjectRead(SQLModel):
    id: int
    title: str
    description: str
    year: str
    file_url: Optional[str] = None
    document_url: Optional[str] = None
    status: Status
    student_id: int
    supervisor_id: Optional[int] = None
    tags: List[Tags] = []
    
    
    class Config:
        from_attributes = True   