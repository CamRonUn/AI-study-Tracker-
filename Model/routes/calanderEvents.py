from fastapi import APIRouter, Depends 
from routes.oauth import get_current_user
from pydantic import BaseModel
from datetime import date
from db_config import get_supabase

router = APIRouter()

class newEvent(BaseModel):
    event: dict

class eventID(BaseModel):
    id: str

class update(BaseModel):
    updates: dict
    id:str

@router.get("/get")
def get_calendar_events(current_user = Depends(get_current_user)):
    try:
        supabase = get_supabase()
        user_email = current_user[0]["email"]
        response = supabase.table("calendar_events").select("*").eq("user_email", user_email).execute().data
        return response
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.post("/addSingle")
def get_calendar_events(payload: newEvent,current_user = Depends(get_current_user)):
    try:
        supabase = get_supabase()
        event = payload.event
        user_email = current_user[0]["email"]
        event["user_email"] = user_email
        print(event)
        message = supabase.table("calendar_events").insert(event).execute()
        print(message)
        response = supabase.table("calendar_events").select("*").eq("user_email", user_email).execute().data
        return response
    except Exception as e:
        print("\n❌ DATABASE INSERT FAILED DETAILED ERROR:")
        print(str(e))
        print("-----------------------------------------\n")
        return {"status": "error", "message": str(e)}
    
@router.delete("/delete")
def delete_calendar_events(payload: eventID,current_user = Depends(get_current_user)):
    try:
        supabase = get_supabase()
        user_email = current_user[0]["email"]
        supabase.table("calendar_events").delete().eq("id", payload.id).eq("user_email", user_email).execute()
        response = supabase.table("calendar_events").select("*").eq("user_email", user_email).execute().data
        return response
    except:
        return "failed"
    
@router.put("/update")
def update_calendar_events(payload: update, current_user = Depends(get_current_user)):
    try:
        supabase = get_supabase()
        user_email = current_user[0]["email"]
        supabase.table("calendar_events").update(payload.updates).eq("id", payload.id).eq("user_email", user_email).execute()
        response = supabase.table("calendar_events").select("*").eq("user_email", user_email).execute().data
        return response
    except Exception as e:
        print("\n❌ DATABASE Update FAILED DETAILED ERROR:")
        print(str(e))
        print("-----------------------------------------\n")
        return {"status": "error", "message": str(e)}
