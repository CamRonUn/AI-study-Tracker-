from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from routes import oauth
from pydantic import BaseModel
from dotenv import load_dotenv
from itsdangerous import URLSafeSerializer
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
from routes.helpers.gemini_config import generate_chat_response
from routes.helpers.google_calendar import get_calander_events
from routes import quiz 
from routes import cources
from fastapi.middleware.cors import CORSMiddleware
from routes import calanderEvents
from routes import recommendations

app = FastAPI()

origins = [
    "http://localhost:8081",
    "http://127.0.0.1:8081"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      # This allows any website/IP to access your API
    allow_credentials=True,
    allow_methods=["*"],      # Allows all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],      # Allows all headers (Content-Type, Authorization, etc.)
)

load_dotenv()

security = HTTPBearer()


app.get("/")

app.include_router(oauth.router, prefix="/oauth")
app.include_router(quiz.router, prefix="/quiz")
app.include_router(cources.router, prefix="/courses")
app.include_router(calanderEvents.router, prefix="/calendar")
app.include_router(recommendations.router, prefix="/recommendations")  

def root():
    return {"message": "Sever Running"}

@app.get("/gemini")
async def geminitest():
    ai_response = await generate_chat_response("say hello in yoda") 
    return {"response": ai_response}

@app.get("/calanderTest")
async def calanderTest(auth: HTTPAuthorizationCredentials = Depends(security)):
    return get_calander_events(auth)