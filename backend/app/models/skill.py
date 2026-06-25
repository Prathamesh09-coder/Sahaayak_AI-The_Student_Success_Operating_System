from sqlalchemy import Column, String, Text
import uuid
from app.models.base import Base

class Skill(Base):
    __tablename__ = "skills"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False, unique=True)
    category = Column(String, nullable=True) # e.g., Technical, Soft Skill, Language
    description = Column(Text, nullable=True)
