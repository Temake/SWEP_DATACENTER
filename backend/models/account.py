from sqlmodel import Field, SQLModel

    
class Account(SQLModel,table=True):
    id :int = Field(primary_key=True,nullable=False)
    name:str =Field(nullable=False,unique=True)
    