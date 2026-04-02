from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas, auth

router = APIRouter(tags=["roteiros"])

@router.get("/roteiros", response_model=List[schemas.RoteiroResponse])
def list_roteiros(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    roteiros = db.query(models.Roteiro).filter(
        models.Roteiro.is_active == True
    ).all()
    return roteiros

@router.get("/roteiros/{roteiro_id}", response_model=schemas.RoteiroResponse)
def get_roteiro(
    roteiro_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    roteiro = db.query(models.Roteiro).filter(models.Roteiro.id == roteiro_id).first()
    if not roteiro:
        raise HTTPException(status_code=404, detail="Roteiro não encontrado.")
    return roteiro
    

@router.post("/roteiros", response_model=schemas.RoteiroResponse)
def create_roteiro(
    roteiro: schemas.RoteiroBase, 
    db: Session = Depends(get_db),
    _ = Depends(auth.check_permissions(['admin', 'gestor', 'usuario']))
):
    roteiro_data = roteiro.dict()
    db_roteiro = models.Roteiro(**roteiro_data)
    
    db.add(db_roteiro)
    try:
        db.commit()
        db.refresh(db_roteiro) 
        return db_roteiro
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Erro ao criar roteiro: {str(e)}")

@router.put("/roteiros/{roteiro_id}", response_model=schemas.RoteiroResponse)
def update_roteiro(
    roteiro_id: int,
    roteiro_update: schemas.RoteiroBase, 
    db: Session = Depends(get_db),
    _ = Depends(auth.check_permissions(['admin', 'gestor', 'usuario']))
):
    db_roteiro = db.query(models.Roteiro).filter(models.Roteiro.id == roteiro_id).first()
    if not db_roteiro:
        raise HTTPException(status_code=404, detail="Roteiro não encontrado.")

    for field, value in roteiro_update.dict(exclude_unset=True).items():
        setattr(db_roteiro, field, value)
    
    try:
        db.commit()
        db.refresh(db_roteiro)
        return db_roteiro
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Erro ao atualizar roteiro.")

@router.delete("/roteiros/{roteiro_id}")
def delete_roteiro(
    roteiro_id: int,
    db: Session = Depends(get_db),
    _ = Depends(auth.check_permissions(['admin', 'gestor']))
):
    db_roteiro = db.query(models.Roteiro).filter(models.Roteiro.id == roteiro_id).first()
    if not db_roteiro:
        raise HTTPException(status_code=404, detail="Roteiro não encontrado.")
    
    db_roteiro.is_active = False
    db.commit()
    return {"detail": "Roteiro desativado com sucesso."}