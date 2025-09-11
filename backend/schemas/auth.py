from datetime import datetime, timedelta, timezone
from typing import Annotated

#from schemas.   import xxxxxx model.
import jwt
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jwt.exceptions import JWTException
from passlib.context import CryptContext
from pydantic import BaseModel
from typing import Optional
# new imports.



class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None


class User(BaseModel):
    username: str
    email: str | None = None
    full_name: str | None = None
    disabled: bool | None = None


class UserInDB(User):
    hashed_password: str

class UserBase(BaseModel):
    username: str
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserRead(UserBase):
    id: int

    class Config:
        orm_mode = True  # important to read data from SQLModel ORM


class Token(BaseModel):
    access_token: str
    token_type: str
