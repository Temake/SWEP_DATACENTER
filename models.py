from sqlalchemy import Column, Integer, String, ForeignKey, Table, Text
from sqlalchemy.orm import relationship
from database import Base

# Junction table for many-to-many: Project <-> Tag
project_tag = Table(
    "project_tag",
    Base.metadata,
    Column("project_id", Integer, ForeignKey("projects.project_id"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.tag_id"), primary_key=True),
)


class Department(Base):
    __tablename__ = "departments"

    dept_id = Column(Integer, primary_key=True, index=True)
    dept_name = Column(String, unique=True, index=True)
    faculty = Column(String)

    students = relationship("Student", back_populates="department_rel")
    supervisors = relationship("Supervisor", back_populates="department_rel")


class Student(Base):
    __tablename__ = "students"

    student_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    department = Column(Integer, ForeignKey("departments.dept_id"))
    level = Column(String)

    projects = relationship("Project", back_populates="student")
    department_rel = relationship("Department", back_populates="students")


class Supervisor(Base):
    __tablename__ = "supervisors"

    supervisor_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    department = Column(Integer, ForeignKey("departments.dept_id"))

    projects = relationship("Project", back_populates="supervisor")
    department_rel = relationship("Department", back_populates="supervisors")


class Project(Base):
    __tablename__ = "projects"

    project_id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    year = Column(String)

    student_id = Column(Integer, ForeignKey("students.student_id"))
    supervisor_id = Column(Integer, ForeignKey("supervisors.supervisor_id"))

    student = relationship("Student", back_populates="projects")
    supervisor = relationship("Supervisor", back_populates="projects")

    tags = relationship("Tag", secondary=project_tag, back_populates="projects")


class Tag(Base):
    __tablename__ = "tags"

    tag_id = Column(Integer, primary_key=True, index=True)
    tag_name = Column(String, unique=True, index=True)

    projects = relationship("Project", secondary=project_tag, back_populates="tags")
