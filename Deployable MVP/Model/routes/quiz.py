from fastapi import APIRouter, Depends 
from datetime import date
from routes.helpers.gemini_config import generate_chat_response
from pydantic import BaseModel
from routes.oauth import get_current_user 
from routes.recommendations import generate_recommendations
import asyncio
from db_config import get_supabase

router = APIRouter()

class QuizRequest(BaseModel):
    course: str
    start_date: str | None = None  # make optional so missing field doesn't 422

class QuizAnswers(BaseModel):
    answers: dict
    subject: str
    # removed userEmail — we get it from the JWT token instead (fixes RLS)

@router.post("/newquiz")
async def newQuiz(payload: QuizRequest, current_user=Depends(get_current_user)):
    try:
        supabase = get_supabase()
        course_name = payload.course
        start_Date = payload.start_date or "the beginning of semester"
        todays_Date = date.today()
        prompt = f'''
            Act as an expert academic examiner. Your task is to generate a 7-question multiple-choice quiz based on the course details provided below.

            Course Name: {course_name}
            This is a real course at The University of Queensland (UQ)

            Specific Subjects to Cover:
            Assume the student started the course on {start_Date} and it is currently {todays_Date}, so only test content they have likely covered.

            Strict Output Requirements:
            Provide exactly 7 questions.
            Each question must have exactly 4 answer options.
            You must output the result ONLY as a single JSON object. No conversational text before or after the JSON.

            Use the following JSON schema strictly:
            {{
            "quiz": {{
                "question_1": {{
                "question": "Question text here",
                "answer_1": "Option A",
                "answer_2": "Option B",
                "answer_3": "Option C",
                "answer_4": "Option D",
                "correct_answer": "The exact text of the correct answer",
                "subject": "the subject the question is about examples: limits or derivatives or python syntax"
                }}
            }}
            }}
            '''
        quiz = await generate_chat_response(prompt)
        return quiz
    except Exception as e:
        print("NEWQUIZ ERROR:", e)
        raise

@router.post("/evaluate")
async def evaluateQuiz(payload: QuizAnswers, current_user=Depends(get_current_user)):
    try:
        supabase = get_supabase()
        print("start eval function")
        # Get email from JWT token — this is what satisfies the RLS policy
        user_email = current_user[0]["email"]

        score = 0
        for key, question in payload.answers.items():
            if question.get("correct"):
                score += 1

        # Insert the row immediately — summary will be filled in background
        response = supabase.table("quiz_results").insert({
            "user_email": user_email,
            "subject": payload.subject,
            "score": score,
            "summary": "Generating summary...",  # placeholder
        }).execute()

        result_id = response.data[0]["id"]

        # Save individual question results
        for i, (key, question) in enumerate(payload.answers.items(), start=1):
            supabase.table("quiz_results").update({
                f"question_{i}": question.get("question"),
                f"useranswer_{i}": question.get("userAnswer"),
                f"correctanswer_{i}": question.get("correctAnswer"),
                f"correct_{i}": question.get("correct"),
            }).eq("id", result_id).execute()

        # Adapt priorities of existing tasks based on quiz score
        total_questions = len(payload.answers)
        percentage = (score / total_questions * 100) if total_questions > 0 else 100
        if percentage < 43:
            new_priority = "High"
        elif percentage < 72:
            new_priority = "Medium"
        else:
            new_priority = "Low"

        # Update all incomplete calendar events for this course
        supabase.table("calendar_events") \
            .update({"priority": new_priority}) \
            .eq("user_email", user_email) \
            .eq("completed", False) \
            .ilike("course", f"%{payload.subject}%") \
            .execute()
        print(f"Updated priority for '{payload.subject}' tasks to {new_priority} (score: {score}/{total_questions} = {percentage:.0f}%)")

        # Return score immediately — don't wait for Gemini
        # Fire off summary + recommendations in the background
        asyncio.create_task(
            _generate_summary_and_recommendations(
                result_id=result_id,
                answers=payload.answers,
                subject=payload.subject,
                current_user=current_user,
            )
        )

        return {"score": score, "result_id": result_id, "new_priority": new_priority}

    except Exception as e:
        print("EVALUATE ERROR:", e)
        raise


async def _generate_summary_and_recommendations(result_id, answers, subject, current_user):
    """Background task — generates AI summary and recommendations after evaluate returns."""
    try:
        supabase = get_supabase()
        # Build readable quiz summary for Gemini
        question_lines = []
        for key, question in answers.items():
            status = "Correct" if question.get("correct") else "Wrong"
            question_lines.append(
                f"- {question.get('question')}\n"
                f"  Student answered: {question.get('userAnswer')} | "
                f"Correct answer: {question.get('correctAnswer')} | {status}"
            )
        quiz_summary_text = "\n".join(question_lines)

        prompt = f'''
            A student just completed a quiz on {subject}. Here are their results:

            {quiz_summary_text}

            In 100 words or less, give a specific, encouraging summary of what they did well
            and what topics they should focus on to improve. Be direct and useful.
            '''
        summary = await generate_chat_response(prompt)

        # Update the row with the real summary
        supabase.table("quiz_results").update({
            "summary": summary
        }).eq("id", result_id).execute()

        # Run recommendations if summary is valid
        if summary and "I'm having trouble thinking right now." not in summary:
            try:
                await generate_recommendations(current_user=current_user)
            except Exception as rec_error:
                print("Recommendation generation failed (non-fatal):", rec_error)
        else:
            print("Skipping recommendations: Gemini summary failed.")

    except Exception as e:
        print("Background summary/recommendations error:", e)
        # Update the row with a fallback message so the user isn't stuck on "Generating..."
        try:
            supabase.table("quiz_results").update({
                "summary": "Summary unavailable. Check your weak areas and keep practising!"
            }).eq("id", result_id).execute()
        except Exception:
            pass


@router.get("/result/{result_id}")
async def getResult(result_id: int, current_user=Depends(get_current_user)):
    supabase = get_supabase()
    """
    Frontend polls this endpoint after evaluate returns.
    Returns the summary once Gemini has finished generating it.
    """
    try:
        response = supabase.table("quiz_results").select("summary, score").eq("id", result_id).execute()
        if not response.data:
            return {"summary": None, "score": None, "ready": False}
        row = response.data[0]
        ready = row["summary"] != "Generating summary..."
        return {"summary": row["summary"], "score": row["score"], "ready": ready}
    except Exception as e:
        print("RESULT FETCH ERROR:", e)
        raise