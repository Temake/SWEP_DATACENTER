from sqlmodel import Field, Session, SQLModel, create_engine, select
from backend.config import config




sqlite_file_name = "database.db"
database_url = config.DATABASE_URL


connect_args = {"check_same_thread": False}
engine = create_engine(database_url, echo=True, connect_args=connect_args)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine, checkfirst=True)