from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from app.models.base import Base

class PostComment(Base):
    __tablename__ = "post_comments"

    id = Column(String, primary_key=True, index=True)
    post_id = Column(String, index=True, nullable=False)
    author_id = Column(String, index=True, nullable=False)
    content = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
