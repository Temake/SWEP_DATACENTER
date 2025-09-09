from sqlalchemy.orm import Session
import models, schemas

# --- Department ---
def create_department(db: Session, dept: schemas.DepartmentCreate):
    db_dept = models.Department(**dept.model_dump())
    db.add(db_dept)
    db.commit()
    db.refresh(db_dept)
    return db_dept

def list_departments(db: Session):
    return db.query(models.Department).all()


# --- Student ---
def create_student(db: Session, student: schemas.StudentCreate):
    db_student = models.Student(**student.model_dump())
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student


# --- Supervisor ---
def create_supervisor(db: Session, supervisor: schemas.SupervisorCreate):
    db_supervisor = models.Supervisor(**supervisor.model_dump())
    db.add(db_supervisor)
    db.commit()
    db.refresh(db_supervisor)
    return db_supervisor


# --- Tag ---
def create_tag(db: Session, tag: schemas.TagCreate):
    db_tag = models.Tag(tag_name=tag.tag_name)
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag

def list_tags(db: Session):
    return db.query(models.Tag).all()


# --- Project ---
def create_project(db: Session, project: schemas.ProjectCreate):
    db_project = models.Project(
        title=project.title,
        description=project.description,
        year=project.year,
        student_id=project.student_id,
        supervisor_id=project.supervisor_id
    )

    if project.tag_ids:
        tags = db.query(models.Tag).filter(models.Tag.tag_id.in_(project.tag_ids)).all()
        db_project.tags = tags

    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


def search_projects(db: Session, tag: str = None, supervisor: str = None, student: str = None):
    query = db.query(models.Project)

    if tag:
        query = query.join(models.Project.tags).filter(models.Tag.tag_name == tag)
    if supervisor:
        query = query.join(models.Supervisor).filter(models.Supervisor.name == supervisor)
    if student:
        query = query.join(models.Student).filter(models.Student.name == student)

    return query.all()
