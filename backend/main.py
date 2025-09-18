
from fastapi import FastAPI
from contextlib import asynccontextmanager
from services.openai import custom_openapi
from fastapi.middleware.cors import CORSMiddleware
from models.database import create_db_and_tables
from models.account import *
from models.database import *
from routers.TagRouter import routers as tag_router
from models.projects import *
from routers.project import routers as project_router
from routers.auth import auth_router
from routers.admin import admin
from routers.supervisor import supervisor_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(
    title="Scholar Base API",
    description="Student Project Datacenter - Backend API for managing academic projects",
    version="1.0.0",
   lifespan=lifespan
)



app.openapi = lambda: custom_openapi(app)



app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/")
def root():
    return {"message": "Welcome to Scholar Base API you can read the docs on the path (root_url)/docs"}


app.include_router(auth_router, prefix="/api", tags=["Authentication"])
app.include_router(router=tag_router, prefix="/api/tags", tags=["Tags"])
app.include_router(project_router, prefix="/api", tags=["Projects"])
app.include_router(admin, prefix="/api", tags=["Admin"])
app.include_router(supervisor_router, prefix="/api", tags=["Supervisor"])

