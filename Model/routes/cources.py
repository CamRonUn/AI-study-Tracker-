# *Note (Farrel - 25/05/2026): Updated CourseSelection model to include Course_code.
#                               Previously only Course_name was stored — Course_code was lost after adding.
#
# Backward compatibility note:
#   Course_code is optional (defaults to "") so older frontend versions that
#   still send plain strings won't break. The backend handles both formats.

from fastapi import APIRouter, Depends 
from db_config import supabase, supabase_admin
from routes.oauth import get_current_user
from pydantic import BaseModel
from datetime import date


router = APIRouter()


# ==== MODELS ====

class CourseItem(BaseModel):
    code: str = ""  # <- optional, defaults to "" for backward compatibility with older frontend
    name: str       # <- required, e.g. "Computer Systems Principles and Programming"

class CourseSelection(BaseModel):
    picked: list[CourseItem]  # Previously: list[str]. Now: list of { code, name } objects.


# ==== ROUTES ====

@router.get("/get")
def get_courses(current_user = Depends(get_current_user)):
    """
    Returns all courses enrolled by the current user.
    Returns both Course_code and Course_name.
    """
    try: 
        user_email = current_user[0]["email"]
        courses = supabase_admin.table("users_Courses") \
            .select("*") \
            .eq("user_email", user_email) \
            .execute().data
        return courses
    except Exception as e:
        print(f"Database error: {str(e)}")
        return {"status": "error", "message": str(e)}


@router.post("/edit")
def add_courses(courses: CourseSelection, current_user = Depends(get_current_user)):
    """
    Replaces all courses for the current user with the new list.
    Accepts { code, name } objects — code is optional for backward compatibility.
    If code is empty, falls back to uppercased name as the code.
    """
    try:
        if not current_user or len(current_user) == 0:
            return {"status": "error", "message": "User context not found"}
            
        user_email = current_user[0]["email"]

        # Delete all existing courses for this user (admin bypasses RLS)
        supabase_admin.table("users_Courses").delete().eq("user_email", user_email).execute()
        
        # Re-insert with both code and name
        for course in courses.picked:
            # Fallback: if code is empty (sent by older frontend), derive it from name
            course_code = course.code.strip() if course.code.strip() else course.name.upper()
            supabase_admin.table("users_Courses").insert({
                "user_email": user_email,
                "Course_code": course_code,
                "Course_name": course.name,
                "start_date": date.today().isoformat()
            }).execute()
            
        return {"status": "success", "message": "Courses saved successfully"}
        
    except Exception as e:
        print(f"Database insertion exception caught: {str(e)}")
        return {"status": "error", "message": str(e)}