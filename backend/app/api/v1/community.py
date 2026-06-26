from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.community_service import community_service
from app.schemas.base import APIResponse
from pydantic import BaseModel
from sqlalchemy.future import select
from sqlalchemy import desc
from app.models.community_group import CommunityGroup
from app.models.group_membership import GroupMembership
from app.models.discussion_post import DiscussionPost
from app.models.user import User
import uuid
from datetime import datetime, timezone

router = APIRouter()

def get_time_ago(dt: datetime) -> str:
    now = datetime.now(timezone.utc)
    if not dt.tzinfo:
        dt = dt.replace(tzinfo=timezone.utc)
    diff = now - dt
    if diff.days > 0:
        return f"{diff.days} days ago"
    hours = diff.seconds // 3600
    if hours > 0:
        return f"{hours} hours ago"
    minutes = (diff.seconds % 3600) // 60
    if minutes > 0:
        return f"{minutes} minutes ago"
    return "Just now"

class PostCreateRequest(BaseModel):
    author_id: str
    title: str
    content: str
    group: str

class CommentCreateRequest(BaseModel):
    author_id: str
    content: str

from app.repositories import profile_repository

@router.get("/groups", response_model=APIResponse)
async def get_groups(student_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CommunityGroup))
    all_groups = result.scalars().all()
    
    if not all_groups:
        # Seed groups if completely empty
        seed_groups = [
            CommunityGroup(id=f"grp_{uuid.uuid4().hex[:8]}", name="Machine Learning Aspirants", description="For AI/ML enthusiasts", category="Tech", member_count=1250),
            CommunityGroup(id=f"grp_{uuid.uuid4().hex[:8]}", name="First Generation Learners", description="Support group", category="Support", member_count=3400),
            CommunityGroup(id=f"grp_{uuid.uuid4().hex[:8]}", name="Open Source Contributors", description="Hacktoberfest & beyond", category="Tech", member_count=850)
        ]
        db.add_all(seed_groups)
        await db.commit()
        all_groups = seed_groups
        
    # Find groups the user has already joined
    joined_result = await db.execute(select(GroupMembership.group_id).where(GroupMembership.student_id == student_id))
    joined_group_ids = set(joined_result.scalars().all())

    # Fetch dynamic student profile to tailor recommendations
    career = await profile_repository.get_career_profile(db, student_id)
    family = await profile_repository.get_family_profile(db, student_id)
    
    suggested_groups = []
    
    for g in all_groups:
        if g.id in joined_group_ids:
            continue # Don't suggest groups they already joined
            
        # Very simple dynamic matching rules based on real data
        is_match = False
        
        if "First Generation" in g.name and family and family.first_generation_learner:
            is_match = True
            
        elif "Machine Learning" in g.name and career and career.dream_career and "ML" in career.dream_career.upper():
            is_match = True
            
        elif "Open Source" in g.name:
            # General fallback suggestion
            is_match = True
            
        # If no profile data exists, just suggest everything (graceful fallback)
        if not career and not family:
            is_match = True
            
        if is_match:
            suggested_groups.append({
                "id": g.id,
                "name": g.name,
                "member_count": g.member_count
            })
            
    return APIResponse(success=True, message="Suggested groups fetched", data=suggested_groups)

@router.post("/groups/{id}/join", response_model=APIResponse)
async def join_group(id: str, student_id: str, db: AsyncSession = Depends(get_db)):
    membership = GroupMembership(
        id=f"mem_{uuid.uuid4().hex[:8]}",
        group_id=id,
        student_id=student_id,
        role="MEMBER"
    )
    db.add(membership)
    await db.commit()
    return APIResponse(success=True, message="Group joined", data={"status": "success", "group_id": id})

@router.get("/posts", response_model=APIResponse)
async def get_posts(student_id: str = Query(...), db: AsyncSession = Depends(get_db)):
    stmt = select(DiscussionPost, User.full_name).outerjoin(User, DiscussionPost.author_id == User.id).order_by(desc(DiscussionPost.created_at))
    result = await db.execute(stmt)
    rows = result.all()
    
    if not rows:
        # Seed posts if empty
        seed_posts = [
            DiscussionPost(id=f"post_{uuid.uuid4().hex[:8]}", group_id="General", author_id=student_id, title="How I negotiated my first salary offer!", content="Coming from a rural background, I never thought I could negotiate. Here's exactly what I said to the HR...", likes=124, tags=["InterviewPrep", "Negotiation"]),
            DiscussionPost(id=f"post_{uuid.uuid4().hex[:8]}", group_id="General", author_id=student_id, title="Best resources for System Design?", content="I'm starting my System Design prep for upcoming interviews. Has anyone found a good free resource?", likes=45, tags=["SystemDesign", "TechResources"])
        ]
        db.add_all(seed_posts)
        await db.commit()
        
        # Refetch
        result = await db.execute(stmt)
        rows = result.all()

    formatted_posts = []
    for post, author_name in rows:
        
        time_diff = ""
        if post.created_at:
            time_diff = get_time_ago(post.created_at)
        else:
            time_diff = "Just now"
            
        formatted_posts.append({
            "id": post.id,
            "author": author_name or "Anonymous Student",
            "group": post.group_id or "General",
            "title": post.title,
            "content": post.content,
            "likes": post.likes or 0,
            "comments": 0,
            "time": time_diff
        })
        
    return APIResponse(success=True, message="Posts fetched", data=formatted_posts)

@router.post("/posts", response_model=APIResponse)
async def create_post(request: PostCreateRequest, db: AsyncSession = Depends(get_db)):
    new_post = DiscussionPost(
        id=f"post_{uuid.uuid4().hex[:8]}",
        author_id=request.author_id,
        title=request.title,
        content=request.content,
        group_id=request.group
    )
    db.add(new_post)
    await db.commit()
    return APIResponse(success=True, message="Post created", data={"id": new_post.id, "status": "created", "title": new_post.title})

@router.get("/posts/{id}", response_model=APIResponse)
async def get_post(id: str, db: AsyncSession = Depends(get_db)):
    return APIResponse(success=True, message="Post fetched", data={"id": id, "content": "Mock Content"})

@router.post("/posts/{post_id}/comments", response_model=APIResponse)
async def create_comment(post_id: str, request: CommentCreateRequest, db: AsyncSession = Depends(get_db)):
    return APIResponse(success=True, message="Comment added", data={"id": "comment_new", "post_id": post_id, "status": "created"})

@router.get("/trending", response_model=APIResponse)
async def get_trending(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DiscussionPost.tags))
    rows = result.scalars().all()
    
    tag_counts = {}
    for tags in rows:
        if tags and isinstance(tags, list):
            for tag in tags:
                tag_counts[tag] = tag_counts.get(tag, 0) + 1
                
    # Sort by count descending
    sorted_tags = sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)
    
    # Format for frontend which expects { "name": tag, "count": posts_count }
    res = [{"name": tag, "count": count} for tag, count in sorted_tags[:5]]
    
    # Fallback mock if completely empty
    if not res:
        res = [
            {"name": "Gate2027Prep", "count": 342},
            {"name": "TCSNinjaTips", "count": 210},
            {"name": "ReactInterview", "count": 185}
        ]
        
    return APIResponse(success=True, message="Trending topics fetched", data=res)
