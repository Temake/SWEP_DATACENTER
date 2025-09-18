from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr
from core.dependencies import AccountType
from services.enums import Role


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[Role] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: Role
    department: Optional[str] = None


class StudentRegister(UserBase):
    password: str
    matric_no: str
    role: Role = Role.STUDENT


class SupervisorRegister(UserBase):
    password: str
    faculty: Optional[str] = None
    office_address: Optional[str] = None
    phone_number: Optional[str] = None
    title: Optional[str] = None  # Changed from position to title
    bio: Optional[str] = None
    role: Role = Role.SUPERVISOR


class AdminRegister(UserBase):
    password: str
    role: Role = Role.ADMIN


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: Role
    department: Optional[str] = None
    email_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


class StudentResponse(UserResponse):
    matric_no: str
    supervisor_id: Optional[int] = None


class SupervisorResponse(UserResponse):
    faculty: Optional[str] = None
    office_address: Optional[str] = None
    phone_number: Optional[str] = None
    title: Optional[str] = None  # Changed from position to title
    bio: Optional[str] = None


class AdminResponse(UserResponse):
    pass



class PasswordChange(BaseModel):
    current_password: str
    new_password: str


class PasswordReset(BaseModel):
    email: EmailStr


class EmailVerification(BaseModel):
    token: str


class Token(BaseModel):
    user:AccountType
    access_token: str
    token_type: str