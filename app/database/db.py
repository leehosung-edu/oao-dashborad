from sqlmodel import SQLModel, create_engine, Session
from pathlib import Path
import os

# SQLite database URL
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DATA_DIR / "database.db"
sqlite_url = f"sqlite:///{DB_PATH}"

# SQLite database 연결
connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, echo=True, connect_args=connect_args)

# 데이터베이스 및 테이블 생성
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

# 데이터베이스 생성
def get_db():
    with Session(engine) as session:
        yield session