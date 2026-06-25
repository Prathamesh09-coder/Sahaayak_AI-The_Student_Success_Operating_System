from sqlalchemy import Column, String, Integer, JSON, DateTime
from sqlalchemy.sql import func
from app.models.base import Base

class DiscussionPost(Base):
    __tablename__ = "discussion_posts"

    id = Column(String, primary_key=True, index=True)
    group_id = Column(String, index=True)
    author_id = Column(String, index=True, nullable=False)
    title = Column(String, nullable=False)
    content = Column(String)
    tags = Column(JSON)
    likes = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
