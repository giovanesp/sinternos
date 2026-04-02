from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import extract
from datetime import date, datetime
import pandas as pd
import io
from database import get_db
import models, schemas, auth
from typing import List

router = APIRouter(prefix="/api", tags=["colaboradores"])

# --- ROTAS ADMINISTRATIVAS ---
@router.get("/admin/colaboradores", response_model=List[schemas.ColaboradorResponse])
def list_colaboradores_admin(
    db: Session = Depends(get_db),
    _ = Depends(auth.check_permissions(['rh', 'admin_ti']))
):
    return db.query(models.Colaborador).order_by(models.Colaborador.nome).all()

@router.get("/admin/colaboradores/{colab_id}", response_model=schemas.ColaboradorResponse)
def get_colaborador(
    colab_id: int, 
    db: Session = Depends(get_db),
    _ = Depends(auth.check_permissions(['rh', 'admin_ti']))
):
    db_colab = db.query(models.Colaborador).filter(models.Colaborador.id == colab_id).first()
    if not db_colab:
        raise HTTPException(status_code=404, detail="Colaborador não encontrado")
    return db_colab

@router.post("/admin/colaboradores", response_model=schemas.ColaboradorResponse)
def create_colaborador(
    colab: schemas.ColaboradorBase, 
    db: Session = Depends(get_db),
    _ = Depends(auth.check_permissions(['rh', 'admin_ti']))
):
    db_colab = models.Colaborador(**colab.dict())
    db.add(db_colab)
    db.commit()
    db.refresh(db_colab)
    return db_colab

@router.put("/admin/colaboradores/{colab_id}", response_model=schemas.ColaboradorResponse)
def update_colaborador(
    colab_id: int, 
    colab: schemas.ColaboradorBase, 
    db: Session = Depends(get_db),
    _ = Depends(auth.check_permissions(['rh', 'admin_ti']))
):
    db_colab = db.query(models.Colaborador).filter(models.Colaborador.id == colab_id).first()
    if not db_colab:
        raise HTTPException(status_code=404, detail="Colaborador não encontrado")
    
    for key, value in colab.dict().items():
        setattr(db_colab, key, value)
    
    db.commit()
    db.refresh(db_colab)
    return db_colab

@router.delete("/admin/colaboradores/{colab_id}")
def delete_colaborador(
    colab_id: int, 
    db: Session = Depends(get_db),
    _ = Depends(auth.check_permissions(['rh', 'admin_ti']))
):
    db_colab = db.query(models.Colaborador).filter(models.Colaborador.id == colab_id).first()
    if not db_colab:
        raise HTTPException(status_code=404, detail="Colaborador não encontrado")
    
    db.delete(db_colab)
    db.commit()
    return {"message": "Colaborador removido com sucesso"}

# --- ROTAS DE IMPORTAÇÃO E PÚBLICAS (MANTIDAS/AJUSTADAS) ---
@router.post("/admin/colaboradores/import")
async def import_colaboradores(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db),
    _ = Depends(auth.check_permissions(['rh', 'admin_ti']))
):
    content = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(content), sep=None, engine='python', encoding='utf-8')
    except:
        df = pd.read_csv(io.BytesIO(content), sep=None, engine='python', encoding='latin1')
        
    df.columns = [c.lower().strip() for c in df.columns]
    
    for _, row in df.iterrows():
        try:
            data_nasc = pd.to_datetime(row.get('nascimento')).date()
        except:
            continue
        
        novo = models.Colaborador(
            nome=str(row.get('nome')).strip(),
            cargo=str(row.get('cargo', '')).strip(),
            setor=str(row.get('setor', '')).strip(),
            empresa=str(row.get('empresa', 'Cortezia')).strip(),
            unidade=str(row.get('unidade', 'Lucas do Rio Verde')).strip(),
            data_nascimento=data_nasc,
            ramal=str(row.get('ramal', '')),
            whatsapp=str(row.get('whatsapp', '')),
            is_active=True
        )
        db.add(novo)
    
    db.commit()
    return {"message": "Importação concluída com sucesso!"}

@router.get("/aniversariantes")
def list_aniversariantes_mes(db: Session = Depends(get_db)):
    hoje = date.today()
    colaboradores = db.query(models.Colaborador)\
        .filter(extract('month', models.Colaborador.data_nascimento) == hoje.month)\
        .filter(models.Colaborador.is_active == True).all()
    
    res = [{
        "id": c.id,
        "nome": c.nome,
        "cargo": c.cargo,
        "empresa": c.empresa,
        "data": c.data_nascimento.strftime("%d/%m"),
        "hoje": (c.data_nascimento.day == hoje.day and c.data_nascimento.month == hoje.month)
    } for c in colaboradores]
    
    return sorted(res, key=lambda x: (not x['hoje'], x['data']))

