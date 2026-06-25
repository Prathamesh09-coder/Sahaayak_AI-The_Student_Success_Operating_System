from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.community_service import community_service
from app.schemas.base import APIResponse
from pydantic import BaseModel

router = APIRouter()

class PostCreateRequest(BaseModel):
    author_id: str
    title: str
    content: str
    group: str

class CommentCreateRequest(BaseModel):
    post_id: str
    author_id: str
    content: str

@router.get("/groups", response_model=APIResponse)
async def get_groups(student_id: str, db: AsyncSession = Depends(get_db)):
    mock_student = {
        "career_goal": "ML Engineer",
        "is_first_generation": True
    }
    res = community_service.get_suggested_groups(mock_student)
    return APIResponse(success=True, message="Suggested groups fetched", data=res)

@router.post("/groups/{id}/join", response_model=APIResponse)
async def join_group(id: str, student_id: str, db: AsyncSession = Depends(get_db)):
    return APIResponse(success=True, message="Group joined", data={"status": "success", "group_id": id})

@router.get("/posts", response_model=APIResponse)
async def get_posts(student_id: str = Query(...), db: AsyncSession = Depends(get_db)):
    mock_posts = [
        {
            "id": "post1",
            "author": "Priya M.",
            "group": "First Generation Learners",
            "title": "How I negotiated my first salary offer!",
            "content": "Coming from a rural background, I never thought I could negotiate. Here's exactly what I said to the HR...",
            "likes": 124,
            "comments": 32,
            "time": "2 hours ago"
        },
        {
            "id": "post2",
            "author": "Rahul D.",
            "group": "Machine Learning Aspirants",
            "title": "Best resources for System Design?",
            "content": "I'm starting my System Design prep for upcoming interviews. Has anyone found a good free resource?",
            "likes": 45,
            "comments": 18,
            "time": "5 hours ago"
        }
    ]
    return APIResponse(success=True, message="Posts fetched", data=mock_posts)

@router.post("/posts", response_model=APIResponse)
async def create_post(request: PostCreateRequest, db: AsyncSession = Depends(get_db)):
    return APIResponse(success=True, message="Post created", data={"id": "post_new", "status": "created", "title": request.title})

@router.get("/posts/{id}", response_model=APIResponse)
async def get_post(id: str, db: AsyncSession = Depends(get_db)):
    return APIResponse(success=True, message="Post fetched", data={"id": id, "content": "Mock Content"})

@router.post("/comments", response_model=APIResponse)
async def create_comment(request: CommentCreateRequest, db: AsyncSession = Depends(get_db)):
    return APIResponse(success=True, message="Comment added", data={"id": "comment_new", "status": "created"})

@router.get("/trending", response_model=APIResponse)
async def get_trending(db: AsyncSession = Depends(get_db)):
    res = community_service.get_trending_topics()
    return APIResponse(success=True, message="Trending topics fetched", data=res)
