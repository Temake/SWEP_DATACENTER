
from sqlmodel import Field, Relationship,SQLModel
from services.enums import Status

class Project(SQLModel, table=True):
    id:int = Field(primary_key=True,nullable=False)