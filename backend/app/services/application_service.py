import uuid
from datetime import datetime

class ApplicationService:
    async def track_application(self, student_id: str, opportunity_id: str, status: str) -> dict:
        # In real world, persist to DB
        return {
            "id": str(uuid.uuid4()),
            "student_id": student_id,
            "opportunity_id": opportunity_id,
            "status": status,
            "updated_at": datetime.utcnow()
        }

application_service = ApplicationService()
