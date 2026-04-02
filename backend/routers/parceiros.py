from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas, auth

router = APIRouter(tags=["parceiros"])

@router.get("/parceiros", response_model=List[schemas.ParceiroResponse])
def list_parceiros(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Parceiro).filter(models.Parceiro.is_active == True).all()

@router.post("/parceiros", response_model=schemas.ParceiroResponse)
def create_parceiro(
    parceiro: schemas.ParceiroBase, 
    db: Session = Depends(get_db),
    _ = Depends(auth.check_permissions(['admin', 'super_admin']))
):
    if parceiro.cnpj:
        existing = db.query(models.Parceiro).filter(models.Parceiro.cnpj == parceiro.cnpj).first()
        if existing:
            raise HTTPException(status_code=400, detail="Parceiro com este CNPJ já cadastrado.")

    new_parceiro = models.Parceiro(**parceiro.dict())
    db.add(new_parceiro)
    db.commit()
    db.refresh(new_parceiro)
    return new_parceiro

@router.delete("/parceiros/{parceiro_id}")
def deactivate_parceiro(
    parceiro_id: int,
    db: Session = Depends(get_db),
    _ = Depends(auth.check_permissions(['super_admin']))
):
    db_parceiro = db.query(models.Parceiro).filter(models.Parceiro.id == parceiro_id).first()
    if not db_parceiro:
        raise HTTPException(status_code=404, detail="Parceiro não encontrado.")
    
    db_parceiro.is_active = False
    db.commit()
    return {"detail": "Parceiro desativado com sucesso."}