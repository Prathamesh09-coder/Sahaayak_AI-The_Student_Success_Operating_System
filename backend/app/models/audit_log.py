from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from app.models.base import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False)
    action = Column(String, nullable=False)
    resource = Column(String)
    details = Column(String)
    ip_address = Column(String)
    user_agent = Column(String)
    status = Column(String) # SUCCESS, FAILURE
    correlation_id = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
