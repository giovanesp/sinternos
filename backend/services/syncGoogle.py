from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials

def sync_evento_to_google(db_evento: models.Evento, user_credentials: dict):
    """
    Traduz o seu modelo de Evento para o formato esperado pelo Google.
    """
    creds = Credentials.from_authorized_user_info(user_credentials)
    service = build('calendar', 'v3', credentials=creds)

    event_body = {
        'summary': db_evento.titulo,
        'description': db_evento.descricao,
        'start': {
            'dateTime': db_evento.data_inicio.isoformat(),
            'timeZone': 'America/Cuiaba',
        },
        'end': {
            'dateTime': db_evento.data_fim.isoformat(),
            'timeZone': 'America/Cuiaba',
        },
        'colorId': '5',
    }

    try:
        if db_evento.google_event_id:
            updated_event = service.events().update(
                calendarId='primary', 
                eventId=db_evento.google_event_id, 
                body=event_body
            ).execute()
            return updated_event.get('id')
        else:
            new_event = service.events().insert(
                calendarId='primary', 
                body=event_body
            ).execute()
            return new_event.get('id')
            
    except Exception as e:
        print(f"Erro na sincronização Google: {e}")
        return None