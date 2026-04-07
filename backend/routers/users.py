from urllib import request
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import io, pandas as pd
from database import get_db
import models, schemas, auth

router = APIRouter(tags=["users"])

@router.get("/users", response_model=List[schemas.UserResponse])
def list_users(
    is_director: bool | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.User)

    if is_director is not None:
        query = query.filter(models.User.is_director == is_director)
    
    return query.order_by(models.User.nome).all()

@router.get("/users/{user_id}", response_model=schemas.UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    _ = Depends(auth.check_permissions(['admin']))
):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    return db_user

@router.post("/users", response_model=schemas.UserResponse)
def create_new_user(
    user: schemas.UserCreate, 
    db: Session = Depends(get_db),
    _ = Depends(auth.check_permissions(['admin']))
):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username já cadastrado.")
    
    hashed_pw = auth.get_password_hash(user.password)
    user_data = user.dict(exclude={'password'})
    db_new_user = models.User(**user_data, hashed_password=hashed_pw)
    
    db.add(db_new_user)
    db.commit()
    db.refresh(db_new_user)
    return db_new_user


@router.put("/users/{user_id}", response_model=schemas.UserResponse)
def update_user(
    user_id: int,
    user_update: schemas.UserUpdate, 
    db: Session = Depends(get_db),
    _ = Depends(auth.check_permissions(['admin']))
):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    db_user.nome = user_update.nome
    db_user.email = user_update.email
    db_user.role = user_update.role
    db_user.username = user_update.username
    db_user.is_active = user_update.is_active
    
    if user_update.password and user_update.password.strip():
        db_user.hashed_password = auth.get_password_hash(user_update.password)

    try:
        db.commit()
        db.refresh(db_user)
        return db_user
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Erro ao atualizar: Verifique se o username já existe.")
    
@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    _ = Depends(auth.check_permissions(['admin']))
):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    
    if db_user.username == "admin":
        raise HTTPException(status_code=400, detail="Não é possível remover o administrador principal.")


    db.delete(db_user)
    db.commit()
    return {"detail": "Usuário removido com sucesso."}


@router.post("/users/{user_id}/vincular-empresa/{empresa_id}")
def vincular_usuario_empresa(
    user_id: int, 
    empresa_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    empresa = db.query(models.Empresa).filter(models.Empresa.id == empresa_id).first()

    if not user or not empresa:
        raise HTTPException(status_code=404, detail="Usuário ou Empresa não encontrados")

    if empresa in user.empresas:
        raise HTTPException(status_code=400, detail="Usuário já tem acesso a esta empresa")

    user.empresas.append(empresa)
    db.commit()
    return {"message": f"Acesso concedido: {user.nome} -> {empresa.razao_social}"}

@router.delete("/users/{user_id}/remover-empresa/{empresa_id}")
def remover_usuario_empresa(
    user_id: int, 
    empresa_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    empresa = db.query(models.Empresa).filter(models.Empresa.id == empresa_id).first()

    if not user or not empresa:
        raise HTTPException(status_code=404, detail="Usuário ou Empresa não encontrados")

    if empresa not in user.empresas:
        raise HTTPException(status_code=400, detail="Usuário não tem acesso a esta empresa")

    user.empresas.remove(empresa)
    db.commit()
    return {"message": f"Acesso removido: {user.nome} -> {empresa.razao_social}"}


@router.post("/users/{user_id}/gerar-token-agenda", response_model=schemas.TokenIntegrationResponse)
def generate_integration_token(
    user_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.id != user_id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Não autorizado.")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user or not user.is_director:
        raise HTTPException(status_code=404, detail="Diretor não encontrado.")

    new_token = secrets.token_urlsafe(32)
    user.integration_token = new_token
    
    db.commit()
    
    baseUrl = os.getenv("APP_URL")+"/eventos/export"
    return {
        "token": new_token,
        "feed_url": f"{baseUrl}/{new_token}.ics"
    }