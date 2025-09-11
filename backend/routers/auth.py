from datetime import datetime, timedelta, timezone
from typing import Annotated

#from schemas.   import xxxxxx model.
import jwt
from fastapi import Depends, APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jwt.exceptions import JWTException
from passlib.context import CryptContext
from pydantic import BaseModel
from services.auth import *
from schemas.auth import *

SECRET_KEY = "dj=k3n903*99*%$)4qu$ohdexpvh!rq*6iu7y5uiwtp_=zb&3)"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

auth= APIRouter()

@auth.post("/token")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Token:
    user = authenticate_user(Session, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail = "Incorrect username or password",
            headers= {"WWW-Authenticate": "Bearer"},
        )
    ACCESS_TOKEN_EXPIRE_MINUTES = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub":user.username}, expires_delta=30
    )
    return Token(access_token=access_token, token_type="bearer")