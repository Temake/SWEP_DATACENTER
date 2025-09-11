from datetime import timedelta
from typing import Annotated

import jwt
from fastapi import Depends, APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlmodel import select, Session
from models import User
from models.database import get_db
from models import User
from schemas.auth import UserCreate, UserRead, Token
from services.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    authenticate_user,
)

SECRET_KEY = "dj=k3n903*99*%$)4qu$ohdexpvh!rq*6iu7y5uiwtp_=zb&3)"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

auth_router = APIRouter(prefix="/auth", tags=["Auth"])


@auth_router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Session = Depends(get_db),
) -> Token:
    user = authenticate_user(session, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")

@auth_router.post("/register", response_model=UserRead)
def register(user: UserCreate, session: Session = Depends(get_db)):
    db_user = session.exec(select(User).where(User.username == user.username)).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        full_name=user.full_name,
        hashed_password=hashed_password,
    )
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


# routers/auth.py
from fastapi import APIRouter

auth_router = APIRouter()

@auth_router.post("/register")
def register_user():
    return {"msg": "User registered"}

@auth_router.post("/login")
def login_user():
    return {"msg": "User logged in"}
