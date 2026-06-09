from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi import APIRouter
from realtime import Optional
from db_config import get_supabase
from dotenv import load_dotenv
import os
from argon2 import PasswordHasher, exceptions 
from datetime import datetime, timedelta
import jwt
import anyio 

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
ph = PasswordHasher()

### Security Configuration
secretkey = os.environ.get("Secret_Key")
Algorithm = os.environ.get("Algorithm")
token_expire_minutes = 120

class User(BaseModel):
    email: str | None = None
    full_name: str | None = None
    hashed_password: str | None = None
    degree: str | None = None
    role: str | None = "user"

class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    degree: str
    password: str

class UserResponse(BaseModel):
    email: EmailStr
    full_name: str
    degree: str
    role: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# note (25/05/2026): added new model for PATCH /profile endpoint.
class UserUpdate(BaseModel):
    full_name: str  # <- new display name from SettingsScreen
    degree: str     # <- new major/degree from SettingsScreen


#### Security Functions 
def verify_pwd(plain_pwd: str, hashed_pwd: str) -> bool:
    try:
        if plain_pwd == "OAUTH_USER":
            return False
        ph.verify(hashed_pwd, plain_pwd)
        return True
    except exceptions.VerifyMismatchError: 
        return False


def get_pwd_hash(pwd:str) -> str:
    return ph.hash(pwd)

def create_acess_token(data:dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now() + expires_delta
    else:
        expire = datetime.now() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, secretkey, algorithm=Algorithm)
    return encoded_jwt

def verify_token(token:str) -> TokenData:
    try:
        payload = jwt.decode(token, secretkey, algorithms=[Algorithm])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="incorrect user", headers={"WWW-Authenticate": "Bearer"})
        return TokenData(email=email)
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="incorrect user", headers={"WWW-Authenticate": "Bearer"})


#### Auth Dependencies 
async def get_current_user(token: str = Depends(oauth2_scheme)):
    token_data = verify_token(token)
    
    try:
        supabase = get_supabase()
        response = await anyio.to_thread.run_sync(
            lambda: supabase.table("users")
            .select("email", "full_name", "degree", "role")
            .eq("email", token_data.email)
            .limit(1)
            .execute()
        )
        user = response.data
    except Exception as e:
        print(f"Supabase connection error: {e}")
        raise HTTPException(status_code=503, detail="Database connection temporary error")

    if not user: 
        raise HTTPException(status_code=401, detail="user does not exist", headers={"WWW-Authenticate": "Bearer"})
        
    return user


#### Endpoints
@router.post("/register", response_model=Token)
def register_user(user: UserCreate):
    supabase = get_supabase()
    if supabase.table("users").select("*").eq("email", user.email).limit(1).execute().data:
        raise HTTPException(status_code=400, detail="User Already Exists", headers={"WWW-Authenticate": "Bearer"})
    elif user.password == "OAUTH_USER":
        raise HTTPException(status_code=400, detail="Invalid password", headers={"WWW-Authenticate": "Bearer"})
    else: 
        hashed_password = get_pwd_hash(user.password)
        db_user = User(
            email = user.email.lower(),
            full_name = user.full_name,
            degree = user.degree,
            hashed_password = hashed_password
        )
        supabase.table("users").insert({"email": db_user.email, "full_name": db_user.full_name, "degree": db_user.degree, "password": db_user.hashed_password, "role": db_user.role}).execute()
        access_token_expires = timedelta(minutes=token_expire_minutes)
        access_token = create_acess_token(
            data={"sub":db_user.email}, expires_delta=access_token_expires
        )
        return {"access_token":access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
def login_for_acess_token(form_data: OAuth2PasswordRequestForm = Depends()):
    supabase = get_supabase()
    user = supabase.table("users").select("*").eq("email", form_data.username.lower()).limit(1).execute().data
    if not user or not verify_pwd(form_data.password, user[0]["password"]):
        raise HTTPException(
            status_code=404,
            detail="Wrong Info"
        )
    else:
        access_token_expires = timedelta(minutes=token_expire_minutes)
        access_token = create_acess_token(
            data={"sub":user[0]["email"]}, expires_delta=access_token_expires
        )
        return {"access_token":access_token, "token_type": "bearer"}

@router.get("/profile")
def get_profile(current_user = Depends(get_current_user)):
    return current_user[0]

@router.get("/emailexists/{email}")
def check_email_exists(email: str):
    supabase = get_supabase()
    if supabase.table("users").select("*").eq("email", email.lower()).limit(1).execute().data:
        return True
    else:
        return False

@router.patch("/profile")
async def update_profile(updates: UserUpdate, current_user = Depends(get_current_user)):
    try:
        supabase = get_supabase()
        user_email = current_user[0]["email"]
        await anyio.to_thread.run_sync(
            lambda: supabase.table("users")
            .update({"full_name": updates.full_name, "degree": updates.degree})
            .eq("email", user_email)
            .execute()
        )
        return {"status": "success", "message": "Profile updated successfully"}
    except Exception as e:
        print(f"Profile update error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update profile")