from sqlalchemy import Column, String, Float, DateTime
from sqlalchemy.sql import func
from app.models.base import Base

class PeerConnection(Base):
    __tablename__ = "peer_connections"

    id = Column(String, primary_key=True, index=True)
    student_1_id = Column(String, index=True, nullable=False)
    student_2_id = Column(String, index=True, nullable=False)
    match_score = Column(Float)
    status = Column(String, default="PENDING") # PENDING, ACCEPTED, REJECTED
    created_at = Column(DateTime(timezone=True), server_default=func.now())
