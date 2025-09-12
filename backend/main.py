
from fastapi import FastAPI
from contextlib import asynccontextmanager
from models.database import create_db_and_tables
from models.account import *
from models.database import *
from models.projects import *
from routers import auth   # your auth.py file
from routers.auth import auth_router
from fastapi import APIRouter

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

#app = FastAPI(lifespan=lifespan, title="Scholar Base")
app = FastAPI()


@app.get("/")
def root():
   return {"name": "Welcome here"}

app.include_router(auth_router)


#app = FastAPI()

