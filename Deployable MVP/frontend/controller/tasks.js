import {baseURL, loadToken} from './config'

export const getTasks = async () => {
        /*
            returns 
            response = supabase.table("calendar_events").select("*").eq("user_email", user_email).execute().data
            return response
        */
        
        try {
        const token = await loadToken()
        const response = await fetch(`${baseURL}/calendar/get`, { 
            headers: {
                "Authorization": `Bearer ${token}` 
            },
        })
        const data = await response.json()
        return data
    } catch (err) {
        throw err
    }
} 

export const addSingletask = async (task) => {
        /*
            class newEvent(BaseModel):
            event: dict

            router.post("/addSingle")
            def get_calendar_events(payload: newEvent,current_user = Depends(get_current_user)):
                try:
                    event = payload.event
                    user_email = current_user[0]["email"]
                    event["user_email"] = user_email
                    supabase.table("calendar_events").insert(event).execute()
                    response = supabase.table("calendar_events").select("*").eq("user_email", user_email).execute().data
                    return response
                except Exception as e:
                    return {"status": "error", "message": str(e)}
        */
                
        try {
            const token = await loadToken()
            const response = await fetch(`${baseURL}/calendar/addSingle`, {  // ← was /calendar/update
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ event: task })  // ← backend expects { event: dict }, not { task }
            })
            const data = await response.json()
            return data
        } catch (err) {
            throw err
        }
        }



export const deleteTask = async (id) => {
        /*
            class eventID(BaseModel):
            id: str

            router.delete("/delete")
            def delete_calendar_events(payload: eventID,current_user = Depends(get_current_user)):
                try:
                    user_email = current_user[0]["email"]
                    supabase.table("calendar_events").delete().eq("id", payload.id).execute()
                    response = supabase.table("calendar_events").select("*").eq("user_email", user_email).execute().data
                    return response
                except:
                    return "failed"
        */
        
        try {
        const token = await loadToken(id)
        const response = await fetch(`${baseURL}/calendar/delete`, {
            method: 'DELETE' ,
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: String(id)
            })
        })
        const data = await response.json()
        return data
    } catch (err) {
        throw err
    }
} 

export const updateTask = async (updates, id) => {
        /*
            class update(BaseModel):
                updates: dict
                id:str

            router.put("/update")
            def update_calendar_events(payload: update, current_user = Depends(get_current_user)):
                try:
                    user_email = current_user[0]["email"]
                    supabase.table("calendar_events").update(payload.updates).eq("id", payload.id).execute()
                    response = supabase.table("calendar_events").select("*").eq("user_email", user_email).execute().data
                    return response
                except:
                    return "failed"
        */
        
        try {
        const token = await loadToken(id)
        console.log(updates, id)
        const response = await fetch(`${baseURL}/calendar/update`, {
            method: 'PUT',
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                updates: updates,
                id: String(id)
            })
        })
        const data = await response.json()
        return data
    } catch (err) {
        throw err
    }
} 



