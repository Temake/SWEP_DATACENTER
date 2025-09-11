
from sqlmodel import Field, SQLModel,Relationship
from services.enums import Role
from pydantic import EmailStr
from datetime import datetime
from typing import Optional, Tuple,List
from sqlmodel import JSON
from .projects import *



class BaseAccount(SQLModel):
    name:str =Field(nullable=False)
    role:Role
    email:EmailStr =Field(nullable=False,unique=True,index=True)
    email_verified: Optional[bool] = Field(default=False)
    department:str =Field(nullable=True)
    hashed_password:str =Field(nullable=False)
    
    

  
class StudentAccount(BaseAccount,table=True):
    id :int = Field(primary_key=True,nullable=False)
    matric_no:str = Field(nullable=False,unique=True)
    supervisor_id: Optional[int] = Field(default=None, foreign_key="supervisoraccount.id")
    supervisor: Optional["SupervisorAccount"] = Relationship(back_populates="students")

class BaseSupervisor(BaseAccount):
    faculty:Optional[str] = Field(default=None)
    office_address:Optional[str] = Field(default=None)
    phone_number:Optional[str] = Field(default=None,unique=True)
    position:Optional[str] = Field(default=None)
    office_hours: Optional[dict] = Field(default=None, sa_type=JSON)
    bio:Optional[str] = Field(default=None,max_length=300)


class SupervisorAccount(BaseSupervisor,table=True):
    id :int = Field(primary_key=True,nullable=False)
    
    students: List[StudentAccount] = Relationship(back_populates="supervisor")
    supervised_projects: List["Project"] = Relationship(back_populates="supervisor")
    

class AdminAccount(BaseAccount,table=True):
    id :int = Field(primary_key=True,nullable=False)
    
    
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True, nullable=False)
    full_name: Optional[str] = None
    hashed_password: str