
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session
from typing import Union

from models.database import get_session
from models.account import StudentAccount, SupervisorAccount, AdminAccount
from schemas.auth import (
    Token, StudentRegister, SupervisorRegister, AdminRegister,
    UserLogin, StudentResponse, SupervisorResponse, AdminResponse
)
from services.auth import (
    authenticate_user, create_access_token, get_password_hash,
    check_email_exists, check_matric_exists, ACCESS_TOKEN_EXPIRE_MINUTES
)
from services.enums import Role
from core.dependencies import get_current_user, AccountType

auth_router = APIRouter(prefix="/auth", tags=["Authentication"])


@auth_router.post("/register/student", response_model=StudentResponse)
def register_student(
    student_data: StudentRegister,
    session: Session = Depends(get_session)
):
    if check_email_exists(session, student_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    if check_matric_exists(session, student_data.matric_no):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Matric number already registered"
        )
    
    hashed_password = get_password_hash(student_data.password)
    new_student = StudentAccount(
        name=student_data.name,
        email=student_data.email,
        role=Role.STUDENT,
        department=student_data.department,
        hashed_password=hashed_password,
        matric_no=student_data.matric_no
    )
    
    session.add(new_student)
    session.commit()
    session.refresh(new_student)
    
    return new_student


@auth_router.post("/register/supervisor", response_model=SupervisorResponse)
def register_supervisor(
    supervisor_data: SupervisorRegister,
    session: Session = Depends(get_session)
):
    if check_email_exists(session, supervisor_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_password = get_password_hash(supervisor_data.password)
    new_supervisor = SupervisorAccount(
        name=supervisor_data.name,
        email=supervisor_data.email,
        role=Role.SUPERVISOR,
        department=supervisor_data.department,
        hashed_password=hashed_password,
        faculty=supervisor_data.faculty,
        office_address=supervisor_data.office_address,
        phone_number=supervisor_data.phone_number,
        position=supervisor_data.position,
        bio=supervisor_data.bio
    )
    
    session.add(new_supervisor)
    session.commit()
    session.refresh(new_supervisor)
    
    return new_supervisor


@auth_router.post("/register/admin", response_model=AdminResponse)
def register_admin(
    admin_data: AdminRegister,
    session: Session = Depends(get_session)
):
    if check_email_exists(session, admin_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_password = get_password_hash(admin_data.password)
    new_admin = AdminAccount(
        name=admin_data.name,
        email=admin_data.email,
        role=Role.ADMIN,
        department=admin_data.department,
        hashed_password=hashed_password
    )
    
    session.add(new_admin)
    session.commit()
    session.refresh(new_admin)
    
    return new_admin


@auth_router.post("/login", response_model=Token)
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session)
):
    user = authenticate_user(session, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role.value, "user_id": user.id},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@auth_router.post("/login/json", response_model=Token)
def login_user_json(
    login_data: UserLogin,
    session: Session = Depends(get_session)
):
    user = authenticate_user(session, login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role.value, "user_id": user.id},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@auth_router.get("/me")
def get_current_user_info(
    current_user: AccountType = Depends(get_current_user)
):
    if current_user.role == Role.STUDENT:
        return StudentResponse.model_validate(current_user)
    elif current_user.role == Role.SUPERVISOR:
        return SupervisorResponse.model_validate(current_user)
    else:
        return AdminResponse.model_validate(current_user)
