from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import io, pandas as pd
from database import get_db
import models, schemas, auth

router = APIRouter(tags=["empresas"])

@router.get("/empresas", response_model=List[schemas.EmpresaResponse])
def list_empresas(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    empresas = db.query(models.Empresa).filter(
        models.Empresa.is_active == True
    ).order_by(models.Empresa.razao_social).all()
    return empresas

@router.get("/empresas/{empresa_id}", response_model=schemas.EmpresaResponse)
def get_empresa(
    empresa_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_empresa = db.query(models.Empresa).filter(models.Empresa.id == empresa_id).first()
    if not db_empresa:
        raise HTTPException(status_code=404, detail="Empresa não encontrada.")
    return db_empresa   

@router.post("/empresas", response_model=schemas.EmpresaResponse)
def create_empresa(
    empresa: schemas.EmpresaCreate, 
    db: Session = Depends(get_db),
    _ = Depends(auth.check_permissions(['super_admin']))
):
    db_empresa = db.query(models.Empresa).filter(models.Empresa.cnpj == empresa.cnpj).first()
    if db_empresa:
        raise HTTPException(status_code=400, detail="CNPJ já cadastrado.")
    
    empresa_data = empresa.dict()
    db_new_empresa = models.Empresa(**empresa_data)
    
    db.add(db_new_empresa)
    db.commit()
    db.refresh(db_new_empresa)
    return db_new_empresa

@router.put("/empresas/{empresa_id}", response_model=schemas.EmpresaResponse)
def update_empresa(
    empresa_id: int,
    empresa_update: schemas.EmpresaUpdate, 
    db: Session = Depends(get_db),
    _ = Depends(auth.check_permissions(['super_admin']))
):
    db_empresa = db.query(models.Empresa).filter(models.Empresa.id == empresa_id).first()
    if not db_empresa:
        raise HTTPException(status_code=404, detail="Empresa não encontrada.")

    if empresa_update.cnpj and empresa_update.cnpj != db_empresa.cnpj:
        existing = db.query(models.Empresa).filter(models.Empresa.cnpj == empresa_update.cnpj).first()
        if existing:
            raise HTTPException(status_code=400, detail="CNPJ já cadastrado.")

    for field, value in empresa_update.dict(exclude_unset=True).items():
        setattr(db_empresa, field, value)
    
    try:
        db.commit()
        db.refresh(db_empresa)
        return db_empresa
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Erro ao atualizar empresa.")

@router.delete("/empresas/{empresa_id}")
def delete_empresa(
    empresa_id: int,
    db: Session = Depends(get_db),
    _ = Depends(auth.check_permissions(['super_admin']))
):
    db_empresa = db.query(models.Empresa).filter(models.Empresa.id == empresa_id).first()
    if not db_empresa:
        raise HTTPException(status_code=404, detail="Empresa não encontrada.")
    
    db_empresa.is_active = False
    db.commit()
    return {"detail": "Empresa desativada com sucesso."}
