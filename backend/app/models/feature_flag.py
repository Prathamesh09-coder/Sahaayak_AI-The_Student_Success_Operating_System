from sqlalchemy import Column, String, Boolean, Float, DateTime
from sqlalchemy.sql import func
from app.models.base import Base

class FeatureFlag(Base):
    __tablename__ = "feature_flags"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    is_enabled = Column(Boolean, default=False)
    description = Column(String)
    rollout_percentage = Column(Float, default=100.0)
    allowed_roles = Column(String) # Comma separated list of roles
    created_at = Column(DateTime(timezone=True), server_default=func.now())
