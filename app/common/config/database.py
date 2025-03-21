from sqlmodel import SQLModel, create_engine

# SQLite database URL
sqllite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqllite_file_name}"

# SQLite database 연결
connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, echo=True, connect_args=connect_args)

# 데이터베이스 및 테이블 생성
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)