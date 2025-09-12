from datetime import datetime, timedelta, timezone
from typing import Optional, Union
import os
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlmodel import Session, select
from fastapi import HTTPException, status

from models.account import StudentAccount, SupervisorAccount, AdminAccount
from services.enums import Role

SECRET_KEY = os.getenv("SECRET_KEY", "dj=k3n903*99*%$)4qu$ohdexpvh!rq*6iu7y5uiwtp_=zb&3)")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

AccountType = Union[StudentAccount, SupervisorAccount, AdminAccount]


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def get_account_by_email(session: Session, email: str) -> Optional[AccountType]:
    student = session.exec(select(StudentAccount).where(StudentAccount.email == email)).first()
    if student:
        return student
    
    supervisor = session.exec(select(SupervisorAccount).where(SupervisorAccount.email == email)).first()
    if supervisor:
        return supervisor
    
    admin = session.exec(select(AdminAccount).where(AdminAccount.email == email)).first()
    if admin:
        return admin
    
    return None


def authenticate_user(session: Session, email: str, password: str) -> Optional[AccountType]:
    user = get_account_by_email(session, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user(session: Session, token: str) -> AccountType:
    payload = verify_token(token)
    email = payload.get("sub")
    
    user = get_account_by_email(session, email)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def check_email_exists(session: Session, email: str) -> bool:
    return get_account_by_email(session, email) is not None


def check_matric_exists(session: Session, matric_no: str) -> bool:
    student = session.exec(select(StudentAccount).where(StudentAccount.matric_no == matric_no)).first()
    return student is not None
