from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from app.models.base import Base

class GroupMembership(Base):
    __tablename__ = "group_memberships"

    id = Column(String, primary_key=True, index=True)
    group_id = Column(String, index=True, nullable=False)
    student_id = Column(String, index=True, nullable=False)
    role = Column(String, default="MEMBER") # ADMIN, MODERATOR, MEMBER
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
