
from fastapi import APIRouter

auth_router = APIRouter(prefix="/auth", tags=["Auth"])

@auth_router.post("/register")
def register_user():
    return {"msg": "User registered"}

@auth_router.post("/login")
def login_user():
    return {"msg": "User logged in"}

@auth_router.post("/logout")
def logout_user():
    return {"msg": "User logged out"}
