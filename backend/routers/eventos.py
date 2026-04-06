from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List
from database import get_db
import models, schemas, auth
from icalendar import Calendar, Event as ICalEvent

router = APIRouter(tags=["agenda"])

@router.get("/eventos", response_model=List[schemas.EventoOut])
def list_eventos(
    diretor_id: int = None,
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Lista eventos. Diretores podem ver tudo, usuários comuns veem 
    apenas onde são criadores ou o diretor responsável.
    """
    query = db.query(models.Evento)
    
    if not current_user.is_director:
        query = query.filter(
            or_(
                models.Evento.criador_id == current_user.id,
                models.Evento.diretor_id == current_user.id
            )
        )
    
    if diretor_id:
        query = query.filter(models.Evento.diretor_id == diretor_id)
        
    return query.order_by(models.Evento.data_inicio).all()

@router.post("/eventos", response_model=schemas.EventoOut)
def create_evento(
    evento: schemas.EventoCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    conflito = db.query(models.Evento).filter(
        models.Evento.diretor_id == evento.diretor_id,
        models.Evento.data_inicio < evento.data_fim,
        models.Evento.data_fim > evento.data_inicio
    ).first()
    
    if conflito:
        raise HTTPException(status_code=400, detail="O diretor já possui um compromisso neste horário.")

    evento_data = evento.dict()
    db_new_evento = models.Evento(**evento_data, criador_id=current_user.id)
    
    db.add(db_new_evento)
    try:
        db.commit()
        db.refresh(db_new_evento)
        return db_new_evento
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Erro ao criar evento na agenda.")

@router.get("/eventos/{evento_id}", response_model=schemas.EventoOut)
def get_evento(
    evento_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_evento = db.query(models.Evento).filter(models.Evento.id == evento_id).first()
    if not db_evento:
        raise HTTPException(status_code=404, detail="Evento não encontrado.")
    return db_evento

@router.put("/eventos/{evento_id}", response_model=schemas.EventoOut)
def update_evento(
    evento_id: int,
    evento_update: schemas.EventoUpdate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_evento = db.query(models.Evento).filter(models.Evento.id == evento_id).first()
    
    if not db_evento:
        raise HTTPException(status_code=404, detail="Evento não encontrado.")
    
    if db_evento.criador_id != current_user.id and db_evento.diretor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Sem permissão para alterar este evento.")

    update_data = evento_update.dict(exclude_unset=True)
    
    if update_data:
        db_evento.sequence += 1
        for field, value in update_data.items():
            setattr(db_evento, field, value)
    
    db.commit()
    db.refresh(db_evento)
    return db_evento

@router.delete("/eventos/{evento_id}")
def delete_evento(
    evento_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_evento = db.query(models.Evento).filter(models.Evento.id == evento_id).first()
    if not db_evento:
        raise HTTPException(status_code=404, detail="Evento não encontrado.")
    
    if db_evento.criador_id != current_user.id and db_evento.diretor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Permissão negada.")

    db.delete(db_evento)
    db.commit()
    return {"detail": "Evento removido da agenda."}


@router.get("/eventos/export/{token_integracao}.ics")
def export_agenda_ical(
    token_integracao: str, 
    db: Session = Depends(get_db)
):
    """
    Rota pública para assinatura de calendário (Feed iCal).
    O diretor coloca este link no Google Calendar ou iPhone.
    """
    diretor = db.query(models.User).filter(
        models.User.integration_token == token_integracao,
        models.User.is_director == True
    ).first()

    if not diretor:
        raise HTTPException(status_code=404, detail="Agenda não encontrada.")

    eventos = db.query(models.Evento).filter(
        models.Evento.diretor_id == diretor.id
    ).all()

    cal = Calendar()
    cal.add('prodid', '-//Sua Agenda Operacional//diretoria//BR')
    cal.add('version', '2.0')
    cal.add('x-wr-calname', f"Agenda - {diretor.nome}")

    for ev in eventos:
        ievent = ICalEvent()
        ievent.add('summary', ev.titulo)
        ievent.add('description', ev.descricao or "")
        ievent.add('dtstart', ev.data_inicio)
        ievent.add('dtend', ev.data_fim)
        ievent.add('dtstamp', ev.created_at)
        ievent.add('uid', ev.uid)
        ievent.add('sequence', ev.sequence)
        
        cal.add_component(ievent)

    return Response(
        content=cal.to_ical(), 
        media_type="text/calendar",
        headers={"Content-Disposition": f"attachment; filename=agenda_{diretor.id}.ics"}
    )

@router.post("/eventos/{evento_id}/sync-google")
def sync_with_google(
    evento_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Rota para forçar a sincronização via API Push com o Google.
    Exige que você tenha implementado o OAuth2 anteriormente.
    """
    db_evento = db.query(models.Evento).filter(models.Evento.id == evento_id).first()
    
    if not db_evento:
        raise HTTPException(status_code=404, detail="Evento não encontrado.")

    # Aqui entraria a lógica de chamada à API do Google usando o google_event_id
    # do seu model para atualizar ou criar.
    
    return {"status": "Sincronização enviada para o provedor externo"}