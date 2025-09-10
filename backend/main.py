from fastapi import FastAPI
from contextlib import asynccontextmanager
from models.database import create_db_and_tables
from models.account import *
from models.database import *
from routers.TagRouter import routers
from models.projects import *

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan, title="Scholar Base")

@app.get("/")
def root():
    return {"name": "Welcome here"}

app.include_router(router=routers, prefix="/api/tags", tags=["Tags"])