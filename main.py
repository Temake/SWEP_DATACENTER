from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
import models, schemas, crud
from database import engine, SessionLocal

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# DB Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --- Department ---
@app.post("/departments/", response_model=schemas.Department)
def create_department(dept: schemas.DepartmentCreate, db: Session = Depends(get_db)):
    return crud.create_department(db, dept)

@app.get("/departments/", response_model=list[schemas.Department])
def list_departments(db: Session = Depends(get_db)):
    return crud.list_departments(db)


# --- Student ---
@app.post("/students/", response_model=schemas.Student)
def create_student(student: schemas.StudentCreate, db: Session = Depends(get_db)):
    return crud.create_student(db, student)


# --- Supervisor ---
@app.post("/supervisors/", response_model=schemas.Supervisor)
def create_supervisor(supervisor: schemas.SupervisorCreate, db: Session = Depends(get_db)):
    return crud.create_supervisor(db, supervisor)


# --- Tags ---
@app.post("/tags/", response_model=schemas.Tag)
def create_tag(tag: schemas.TagCreate, db: Session = Depends(get_db)):
    return crud.create_tag(db, tag)

@app.get("/tags/list", response_model=list[schemas.Tag])
def list_tags(db: Session = Depends(get_db)):
    return crud.list_tags(db)


# --- Projects ---
@app.post("/projects/", response_model=schemas.Project)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db)):
    return crud.create_project(db, project)

@app.get("/projects/search", response_model=list[schemas.Project])
def search_projects(tag: str = None, supervisor: str = None, student: str = None, db: Session = Depends(get_db)):
    return crud.search_projects(db, tag, supervisor, student)

@app.get("/projects/{id}/tags", response_model=list[schemas.Tag])
def get_project_tags(id: int, db: Session = Depends(get_db)):
    project = db.query(models.Project).get(id)
    return project.tags if project else []
