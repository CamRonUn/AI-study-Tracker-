from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials 
from fastapi import HTTPException
from db_config import supabase
from ..oauth import get_current_user

def get_calander_events(auth):
    #acess token is not jwt token 
    user = get_current_user(auth.credentials)

    try:
        creds = Credentials(token=user[0]["google_access_token"])

        service = build('calendar', 'v3', credentials=creds)

        event_results = service.events().list(calendarId='primary', maxResults=10).execute()

        return event_results
    
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="error") 

        