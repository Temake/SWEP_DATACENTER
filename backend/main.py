from fastapi import FastAPI
from contextlib import asynccontextmanager
from models.database import create_db_and_tables
from models.account import Account

@asynccontextmanager
async def lifespan(app:FastAPI):
    create_db_and_tables()
    yield



app=FastAPI(lifespan=lifespan,title="Student Data Center")

@app.router.get("/")
def root():
    return "Welcome here"
