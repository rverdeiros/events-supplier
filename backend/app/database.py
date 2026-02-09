# app/database.py
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.engine import Engine
import os
from dotenv import load_dotenv

load_dotenv()

# Se não houver DATABASE_URL configurada, usa SQLite (mais simples para desenvolvimento)
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    # SQLite - banco de dados simples (arquivo local, sem servidor)
    # O arquivo será criado automaticamente em backend/database.db
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "database.db")
    DATABASE_URL = f"sqlite:///{db_path}"
    print(f"[SQLite] Usando SQLite: {db_path}")

# Configuração especial para SQLite
connect_args = {}
is_sqlite = DATABASE_URL.startswith("sqlite")

if is_sqlite:
    # SQLite precisa de configuração especial para funcionar com threads
    connect_args = {"check_same_thread": False}
    
    # Habilitar foreign keys no SQLite
    @event.listens_for(Engine, "connect")
    def set_sqlite_pragma(dbapi_conn, connection_record):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

engine = create_engine(
    DATABASE_URL, 
    echo=True, 
    future=True,
    connect_args=connect_args
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency para injeção de sessão em endpoints FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
