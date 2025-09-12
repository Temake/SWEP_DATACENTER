from sqlmodel import Field, Session, SQLModel, create_engine, select
from config import config
from sqlmodel import SQLModel, Session, create_engine


sqlite_file_name = "database.db"
database_url = config.DATABASE_URL

if config.ENV_STATE == 'prod':
     engine = create_engine(database_url, echo=True,)

else:

    connect_args = {"check_same_thread": False}
    engine = create_engine(database_url, echo=True, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session