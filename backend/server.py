from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form, status
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt
import shutil

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
JWT_SECRET = os.environ.get('JWT_SECRET', 'skillproof-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 720  # 30 days

# Security
security = HTTPBearer()

# Create uploads directory
UPLOADS_DIR = ROOT_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)
AVATARS_DIR = UPLOADS_DIR / "avatars"
AVATARS_DIR.mkdir(exist_ok=True)

# Default skill categories
DEFAULT_SKILL_CATEGORIES = [
    "Explain one idea clearly in 60 seconds",
    "Coding & Programming",
    "Design & Creativity",
    "Business & Marketing",
    "Science & Education",
    "Arts & Music",
    "Sports & Fitness",
    "Cooking & Food",
    "DIY & Crafts",
    "Other"
]

# Create the main app
app = FastAPI()

# Mount uploads directory for serving videos with proper content types
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR), html=False), name="uploads")

# Create API router
api_router = APIRouter(prefix="/api")

# Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    display_name: str
    skill_category: str = DEFAULT_SKILL_CATEGORIES[0]

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    display_name: str
    skill_category: str = DEFAULT_SKILL_CATEGORIES[0]
    avatar_url: Optional[str] = None
    created_at: str
    posts_count: int = 0
    validations_received: int = 0

class Post(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    video_url: str
    title: str
    description: str
    skill_category: str
    created_at: str
    validation_count: int = 0
    user: Optional[User] = None
    is_validated_by_me: bool = False

class LeaderboardUser(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    display_name: str
    skill_category: str
    avatar_url: Optional[str] = None
    validations_received: int
    posts_count: int

class Validation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    post_id: str
    user_id: str
    created_at: str

# Helper functions
def create_access_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode = {"sub": user_id, "exp": expire}
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(token: str) -> str:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    return verify_token(credentials.credentials)

# Auth endpoints
@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_id = str(uuid.uuid4())
    hashed_password = pwd_context.hash(user_data.password)
    
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "password_hash": hashed_password,
        "display_name": user_data.display_name,
        "skill_category": user_data.skill_category,
        "avatar_url": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "posts_count": 0,
        "validations_received": 0
    }
    
    await db.users.insert_one(user_doc)
    
    # Generate token
    token = create_access_token(user_id)
    
    return {
        "token": token,
        "user": {
            "id": user_id,
            "email": user_data.email,
            "display_name": user_data.display_name,
            "skill_category": user_data.skill_category,
            "avatar_url": None,
            "posts_count": 0,
            "validations_received": 0
        }
    }

@api_router.post("/auth/login")
async def login(login_data: UserLogin):
    # Find user
    user = await db.users.find_one({"email": login_data.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not pwd_context.verify(login_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Generate token
    token = create_access_token(user["id"])
    
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "display_name": user["display_name"],
            "skill_category": user.get("skill_category", DEFAULT_SKILL_CATEGORIES[0]),
            "avatar_url": user.get("avatar_url"),
            "posts_count": user.get("posts_count", 0),
            "validations_received": user.get("validations_received", 0)
        }
    }

@api_router.get("/auth/me")
async def get_me(user_id: str = Depends(get_current_user)):
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Posts endpoints
@api_router.post("/posts")
async def create_post(
    title: str = Form(...),
    description: str = Form(...),
    skill_category: str = Form(...),
    video: UploadFile = File(...),
    user_id: str = Depends(get_current_user)
):
    # Validate video file
    if not video.content_type or not video.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="File must be a video")
    
    # Save video file
    post_id = str(uuid.uuid4())
    file_extension = video.filename.split(".")[-1] if "." in video.filename else "mp4"
    video_filename = f"{post_id}.{file_extension}"
    video_path = UPLOADS_DIR / video_filename
    
    try:
        with open(video_path, "wb") as buffer:
            shutil.copyfileobj(video.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to upload video")
    
    # Create post document
    post_doc = {
        "id": post_id,
        "user_id": user_id,
        "video_filename": video_filename,
        "title": title,
        "description": description,
        "skill_category": skill_category,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "validation_count": 0
    }
    
    await db.posts.insert_one(post_doc)
    
    # Update user posts count
    await db.users.update_one(
        {"id": user_id},
        {"$inc": {"posts_count": 1}}
    )
    
    return {
        "id": post_id,
        "message": "Post created successfully"
    }

@api_router.get("/posts", response_model=List[Post])
async def get_posts(user_id: str = Depends(get_current_user)):
    # Get all posts sorted by created_at descending
    posts = await db.posts.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    # Get user info for each post
    for post in posts:
        user = await db.users.find_one({"id": post["user_id"]}, {"_id": 0, "password_hash": 0})
        if user:
            # Ensure skill_category exists for backward compatibility
            if "skill_category" not in user:
                user["skill_category"] = DEFAULT_SKILL_CATEGORIES[0]
            post["user"] = user
        
        # Add video URL
        post["video_url"] = f"/uploads/{post['video_filename']}"
        
        # Ensure skill_category exists in post for backward compatibility
        if "skill_category" not in post:
            post["skill_category"] = DEFAULT_SKILL_CATEGORIES[0]
        
        # Check if current user validated this post
        validation = await db.validations.find_one(
            {"post_id": post["id"], "user_id": user_id},
            {"_id": 0}
        )
        post["is_validated_by_me"] = validation is not None
    
    return posts

# Search/filter posts endpoint
@api_router.get("/posts/search", response_model=List[Post])
async def search_posts(
    query: Optional[str] = None,
    skill_category: Optional[str] = None,
    user_id: str = Depends(get_current_user)
):
    # Build search filter
    search_filter = {}
    
    if skill_category and skill_category != "all":
        search_filter["skill_category"] = skill_category
    
    # Get posts
    posts = await db.posts.find(search_filter, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    # Filter by query if provided (search in title, description, or user display_name)
    if query:
        filtered_posts = []
        for post in posts:
            user = await db.users.find_one({"id": post["user_id"]}, {"_id": 0, "password_hash": 0})
            if user:
                # Ensure skill_category exists for backward compatibility
                if "skill_category" not in user:
                    user["skill_category"] = DEFAULT_SKILL_CATEGORIES[0]
                post["user"] = user
                if (query.lower() in post["title"].lower() or 
                    query.lower() in post["description"].lower() or 
                    query.lower() in user["display_name"].lower()):
                    filtered_posts.append(post)
        posts = filtered_posts
    else:
        # Add user info for all posts
        for post in posts:
            user = await db.users.find_one({"id": post["user_id"]}, {"_id": 0, "password_hash": 0})
            if user:
                # Ensure skill_category exists for backward compatibility
                if "skill_category" not in user:
                    user["skill_category"] = DEFAULT_SKILL_CATEGORIES[0]
                post["user"] = user
    
    # Add video URL and validation status
    for post in posts:
        # Ensure skill_category exists in post for backward compatibility
        if "skill_category" not in post:
            post["skill_category"] = DEFAULT_SKILL_CATEGORIES[0]
        
        post["video_url"] = f"/uploads/{post['video_filename']}"
        validation = await db.validations.find_one(
            {"post_id": post["id"], "user_id": user_id},
            {"_id": 0}
        )
        post["is_validated_by_me"] = validation is not None
    
    return posts

@api_router.get("/posts/{post_id}", response_model=Post)
async def get_post(post_id: str, user_id: str = Depends(get_current_user)):
    post = await db.posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Get user info
    user = await db.users.find_one({"id": post["user_id"]}, {"_id": 0, "password_hash": 0})
    if user:
        post["user"] = user
    
    # Add video URL
    post["video_url"] = f"/uploads/{post['video_filename']}"
    
    # Check if current user validated this post
    validation = await db.validations.find_one(
        {"post_id": post_id, "user_id": user_id},
        {"_id": 0}
    )
    post["is_validated_by_me"] = validation is not None
    
    return post

@api_router.post("/posts/{post_id}/validate")
async def validate_post(post_id: str, user_id: str = Depends(get_current_user)):
    # Check if post exists
    post = await db.posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Check if user already validated this post
    existing_validation = await db.validations.find_one(
        {"post_id": post_id, "user_id": user_id},
        {"_id": 0}
    )
    if existing_validation:
        raise HTTPException(status_code=400, detail="You already validated this post")
    
    # Create validation
    validation_doc = {
        "id": str(uuid.uuid4()),
        "post_id": post_id,
        "user_id": user_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.validations.insert_one(validation_doc)
    
    # Update post validation count
    await db.posts.update_one(
        {"id": post_id},
        {"$inc": {"validation_count": 1}}
    )
    
    # Update post owner's validations_received count
    await db.users.update_one(
        {"id": post["user_id"]},
        {"$inc": {"validations_received": 1}}
    )
    
    return {"message": "Post validated successfully"}

@api_router.get("/users/{user_id_param}", response_model=User)
async def get_user_profile(user_id_param: str):
    user = await db.users.find_one({"id": user_id_param}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@api_router.get("/users/{user_id_param}/posts", response_model=List[Post])
async def get_user_posts(user_id_param: str, user_id: str = Depends(get_current_user)):
    posts = await db.posts.find({"user_id": user_id_param}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    for post in posts:
        # Add video URL
        post["video_url"] = f"/uploads/{post['video_filename']}"
        
        # Check if current user validated this post
        validation = await db.validations.find_one(
            {"post_id": post["id"], "user_id": user_id},
            {"_id": 0}
        )
        post["is_validated_by_me"] = validation is not None
    
    return posts

# Avatar upload endpoint
@api_router.post("/users/avatar")
async def upload_avatar(
    avatar: UploadFile = File(...),
    user_id: str = Depends(get_current_user)
):
    # Validate image file
    if not avatar.content_type or not avatar.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Save avatar file
    file_extension = avatar.filename.split(".")[-1] if "." in avatar.filename else "jpg"
    avatar_filename = f"{user_id}.{file_extension}"
    avatar_path = AVATARS_DIR / avatar_filename
    
    try:
        with open(avatar_path, "wb") as buffer:
            shutil.copyfileobj(avatar.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to upload avatar")
    
    # Update user avatar URL
    avatar_url = f"/uploads/avatars/{avatar_filename}"
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"avatar_url": avatar_url}}
    )
    
    return {"avatar_url": avatar_url, "message": "Avatar uploaded successfully"}

# Skill categories endpoint
@api_router.get("/skill-categories")
async def get_skill_categories():
    return {"categories": DEFAULT_SKILL_CATEGORIES}

# Leaderboard endpoint
@api_router.get("/leaderboard", response_model=List[LeaderboardUser])
async def get_leaderboard(limit: int = 10):
    users = await db.users.find(
        {},
        {"_id": 0, "password_hash": 0, "email": 0}
    ).sort("validations_received", -1).limit(limit).to_list(limit)
    
    # Ensure skill_category exists for backward compatibility
    for user in users:
        if "skill_category" not in user:
            user["skill_category"] = DEFAULT_SKILL_CATEGORIES[0]
    
    return users

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()