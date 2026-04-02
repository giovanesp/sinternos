from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
import os
import time
from dotenv import load_dotenv

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def wait_for_db():
    print("⏳ Aguardando conexão com o banco de dados...")
    while True:
        try:
            with engine.connect() as connection:
                connection.execute(text("SELECT 1")) 
                print("✅ Banco de dados conectado!")
                break
        except Exception as e:
            print(f"❌ Erro de conexão: {e}") 
            print("🔄 Tentando novamente em 2s...")
            time.sleep(2)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()