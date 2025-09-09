from fastapi import FastAPI
from contextlib import asynccontextmanager
from backend.models.database import create_db_and_tables
from backend.models.account import Account
from routers import project

@asynccontextmanager
async def lifespan(app:FastAPI):
    create_db_and_tables()
    yield



app=FastAPI(lifespan=lifespan,title="Student Data Center")

@app.get("/")
def read_root():
    return {"message": "Welcome here"}

app.include_router(project.router)