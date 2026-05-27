from fastapi import APIRouter, Depends
from db_config import supabase_admin
from routes.oauth import get_current_user
from routes.helpers.gemini_config import generate_chat_response
from datetime import date
import json
import re

router = APIRouter()


@router.post("/generate")
async def generate_recommendations(current_user):
    """
    Pulls the user's last 2 quiz results, sends them to Gemini,
    deletes their existing AI-generated calendar events, and inserts the new ones.
    """
    try:
        user_email = current_user[0]["email"]
        print("running generate")

        # 1. Grab the user's two most recent quiz results
        results = (
            supabase_admin.table("quiz_results")
            .select("*")
            .eq("user_email", user_email)
            .order("id", desc=True)
            .limit(2)
            .execute()
            .data
        )

        if not results:
            return {"status": "no_quizzes", "message": "No quiz results found to generate recommendations from."}

        today = date.today().isoformat()

        prompt = f"""
You are an expert academic study planner for university students.

Below are a student's most recent quiz results. Each result includes their answers,
whether they were correct, and a summary of their weak areas.

Quiz Results:
{json.dumps(results, indent=2)}

Today's date is {today}.

Your task: Generate a personalised study schedule as a JSON array of calendar events
that will help this student improve in their weak areas over the next 2 weeks.

Rules:
- Generate between 4 and 8 revision events.
- Focus on topics the student got WRONG or the summary flagged as weak.
- Space events out sensibly across the next 14 days — don't pile them all on one day.
- due_date must be a date string in the format YYYY-MM-DD, between {today} and 2 weeks from now.
- due_time should be a realistic study time like "18:00", "19:00", "20:00".
- priority must be one of: "High", "Medium", "Low". Use "High" for topics with many errors.
- course should match the subject field from the quiz result.
- title should be short and specific, e.g. "Revise recursion", "Practice integration".
- type must always be "revision".

You MUST output ONLY a raw JSON array — no markdown, no backticks, no explanation.

Example format:
[
  {{
    "type": "revision",
    "course": "COMP1100",
    "title": "Revise recursion and higher-order functions",
    "due_date": "2026-05-26",
    "due_time": "19:00",
    "priority": "High"
  }}
]
"""

        raw = await generate_chat_response(prompt)
        print("prompt done")

        # Strip markdown fences if Gemini wraps in ```json ... ```
        cleaned = re.sub(r"```(?:json)?|```", "", raw).strip()
        events = json.loads(cleaned)

        # 2. Delete existing AI-generated events for this user
        supabase_admin.table("calendar_events").delete().eq("user_email", user_email).eq(
            "ai_generated", True
        ).execute()

        # 3. Insert new events
        rows = [
            {
                "user_email": user_email,
                "type": e.get("type", "revision"),
                "course": e.get("course", ""),
                "title": e.get("title", ""),
                "completed": False,
                "createdDate": today,
                "dueDate": e.get("due_date"),
                "dueTime": e.get("due_time"),
                "priority": e.get("priority", "Medium"),
                "ai_generated": True,
            }
            for e in events
        ]
        print("added tasks to db")
        inserted = supabase_admin.table("calendar_events").insert(rows).execute()

        return {"status": "success", "events_created": len(inserted.data)}

    except json.JSONDecodeError as e:
        print("Gemini returned invalid JSON:", e)
        print("Raw response was:", raw)
        return {"status": "error", "message": "Gemini returned malformed JSON."}
    except Exception as e:
        print("RECOMMEND ERROR:", e)
        raise