import datetime
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import User, Empresa, Roteiro 
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def seed_db():
    db: Session = SessionLocal()
    
    try:
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

        print("Criando usuários...")
        admin = User(
            username="admin",
            nome="Administrador do Sistema",
            email="admin@admin.com",
            hashed_password=get_password_hash("admin123"),
            role="admin",
            is_active=True
        )
        
        gestor = User(
            username="jhon.dev",
            nome="Jhonatan",
            email="jhon@admin.com",
            hashed_password=get_password_hash("gestor123"),
            role="gestor",
            is_active=True
        )

        print("Criando empresas...")
        empresa1 = Empresa(
            razao_social="Empresa 01 LTDA",
            fantasia="Empresa 01",
            cnpj="12345678000199",
            cidade="Lucas do Rio Verde",
            uf="MT",
            ramo="Agronegócio"
        )

        admin.empresas.append(empresa1)
        gestor.empresas.append(empresa1)

        db.add(admin)
        db.add(gestor)
        db.add(empresa1)
        
        db.commit()
        
        print("Seed finalizado com sucesso!")

    except Exception as e:
        print(f"Erro ao semear banco: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()