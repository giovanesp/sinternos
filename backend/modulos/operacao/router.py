from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date, timedelta
from database import get_db
from modulos.operacao import models, schemas

router = APIRouter(tags=["Operação Diária"])

@router.get("/operacao_diaria/{data_ref}", response_model=List[schemas.OperacaoResponse])
def get_quadro_por_data(data_ref: date, db: Session = Depends(get_db)):
    return db.query(models.OperacaoDiaria).filter(
        models.OperacaoDiaria.data_referencia == data_ref, models.OperacaoDiaria.is_active == True
    ).all()

@router.post("/operacao_diaria/batch", status_code=status.HTTP_201_CREATED)
def save_quadro_batch(payload: schemas.QuadroDiarioBatch, db: Session = Depends(get_db)):
    
    for item in payload.itens:
        existente = None
        if hasattr(item, 'id') and item.id:
            existente = db.query(models.OperacaoDiaria).filter(
                models.OperacaoDiaria.id == item.id
            ).first()
        
        if existente:
            update_data = item.model_dump(exclude_unset=True)
            for key, value in update_data.items():
                setattr(existente, key, value)
        else:
            nova_linha = models.OperacaoDiaria(**item.model_dump())
            db.add(nova_linha)
    
    db.commit()
    return {"message": f"{len(payload.itens)} registros processados com sucesso."}

@router.put("/operacao_diaria/batch", status_code=status.HTTP_201_CREATED)
def update_quadro_batch(
    payload: schemas.QuadroDiarioUpdate, 
    db: Session = Depends(get_db)
):
    for item in payload.itens:
        if hasattr(item, 'id') and item.id:
            db_item = db.query(models.OperacaoDiaria).filter(models.OperacaoDiaria.id == item.id).first()
            if db_item:
                for key, value in item.model_dump().items():
                    setattr(db_item, key, value)
                continue
        
        nova_linha = models.OperacaoDiaria(**item.model_dump())
        db.add(nova_linha)
    
    db.commit()
    return {"message": "Processado com sucesso."}

@router.post("/operacao_diaria/clonar/{data_destino}")
def clonar_quadro_anterior(data_destino: date, db: Session = Depends(get_db)):
    ultimo_registro = db.query(models.OperacaoDiaria).order_by(models.OperacaoDiaria.data_referencia.desc()).first()
    
    if not ultimo_registro:
        raise HTTPException(status_code=404, detail="Nenhum quadro anterior encontrado para clonar.")
    
    data_origem = ultimo_registro.data_referencia
    registros_origem = db.query(models.OperacaoDiaria).filter(models.OperacaoDiaria.data_referencia == data_origem).all()
    
    novos_registros = []
    for reg in registros_origem:
        novo = models.OperacaoDiaria(
            data_referencia=data_destino,
            grupo_nome=reg.grupo_nome,
            motorista_nome=reg.motorista_nome,
            veiculo_placa=reg.veiculo_placa,
            status_cor=reg.status_cor,
            situacao_logistica=reg.situacao_logistica,
            info_viagem=None, 
            observacoes=reg.observacoes,
            is_active=True
        )
        novos_registros.append(novo)
    
    db.add_all(novos_registros)
    db.commit()
    
    return {"message": f"Quadro de {data_origem} clonado para {data_destino} com sucesso."}

@router.delete("/operacao_diaria/{item_id}")
def delete_item_quadro(item_id: int, db: Session = Depends(get_db)):
    item = db.query(models.OperacaoDiaria).filter(models.OperacaoDiaria.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Registro não encontrado")
    db.delete(item)
    db.commit()
    return {"message": "Removido com sucesso"}