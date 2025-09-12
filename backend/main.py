
from fastapi import FastAPI
from contextlib import asynccontextmanager
from models.database import create_db_and_tables
from models.account import *
from models.database import *
from models.projects import *
from routers.project import routers as project_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

#app = FastAPI(lifespan=lifespan, title="Scholar Base")
app = FastAPI()


@app.get("/")
def root():
    return {"message": "Welcome to Scholar Base API you can read the docs on the path (root_url)/docs"}

app.include_router(router=tag_router, prefix="/api/tags", tags=["Tags"])

app.include_router(project_router, prefix="/api", tags=["Projects"])
