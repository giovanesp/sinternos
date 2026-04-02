from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/api/veiculos", tags=["veiculos"])

@router.get("/", response_model=List[schemas.VeiculoResponse])
def list_veiculos(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Veiculo).filter(models.Veiculo.is_active == True).all()

@router.post("/", response_model=schemas.VeiculoResponse)
def create_veiculo(
    veiculo: schemas.VeiculoBase, 
    db: Session = Depends(get_db),
    _ = Depends(auth.check_permissions(['admin', 'super_admin']))
):
    db_veiculo = db.query(models.Veiculo).filter(models.Veiculo.placa == veiculo.placa).first()
    if db_veiculo:
        raise HTTPException(status_code=400, detail="Veículo com esta placa já cadastrado.")
    
    new_veiculo = models.Veiculo(**veiculo.dict())
    db.add(new_veiculo)
    db.commit()
    db.refresh(new_veiculo)
    return new_veiculo

@router.put("/{veiculo_id}", response_model=schemas.VeiculoResponse)
def update_veiculo(
    veiculo_id: int,
    veiculo_update: schemas.VeiculoBase, 
    db: Session = Depends(get_db),
    _ = Depends(auth.check_permissions(['admin', 'super_admin']))
):
    db_veiculo = db.query(models.Veiculo).filter(models.Veiculo.id == veiculo_id).first()
    if not db_veiculo:
        raise HTTPException(status_code=404, detail="Veículo não encontrado.")

    for field, value in veiculo_update.dict(exclude_unset=True).items():
        setattr(db_veiculo, field, value)
    
    db.commit()
    db.refresh(db_veiculo)
    return db_veiculo