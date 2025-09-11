from models.database import create_db_and_tables
from models import Base
from models.account import User
from models.projects import Department, Student, Supervisor, Project, Tag, ProjectTagLink

if __name__ == "__main__":
    create_db_and_tables()
    print("Done, all tables created successfully!")