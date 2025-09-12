
from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from fastapi.security import HTTPBearer
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from models.database import create_db_and_tables
from models.account import *
from models.database import *
from routers.TagRouter import routers as tag_router
from models.projects import *
from routers.project import routers as project_router
from routers.auth import auth_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(
    title="Scholar Base API",
    description="""
    Student Project Datacenter - Backend API for managing academic projects
    
    ## Authentication
    Most endpoints require authentication. To use protected endpoints:
    1. Register/Login to get a JWT token
    2. Click the **Authorize** button (🔒) 
    3. Enter your token in the format: `Bearer your-jwt-token`
    4. Or add Authorization header: `Bearer your-jwt-token`
    """,
    version="1.0.0",
    lifespan=lifespan,
)


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    
    # Define security schemes
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "JWT Authorization header using the Bearer scheme. Example: 'Bearer your-jwt-token'"
        }
    }
    
    # Add security requirements to protected endpoints
    protected_paths = [
        "/api/projects",
        "/api/auth/me"
    ]
    
    for path, path_item in openapi_schema["paths"].items():
        # Check if this path should be protected
        should_protect = any(path.startswith(protected) for protected in protected_paths)
        if should_protect:
            for method, operation in path_item.items():
                if method.lower() in ["get", "post", "put", "patch", "delete"]:
                    operation["security"] = [{"BearerAuth": []}]
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi



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

