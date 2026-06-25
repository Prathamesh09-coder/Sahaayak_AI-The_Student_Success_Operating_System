from uuid import uuid4

class SessionService:
    def request_session(self, student_id: str, mentor_id: str) -> dict:
        return {
            "id": f"sess_{uuid4().hex[:8]}",
            "mentor_id": mentor_id,
            "student_id": student_id,
            "status": "REQUESTED"
        }
        
    def confirm_session(self, session_id: str) -> dict:
        meeting_link = f"https://meet.google.com/mock-{uuid4().hex[:8]}"
        return {
            "id": session_id,
            "status": "CONFIRMED",
            "meeting_link": meeting_link
        }
        
    def cancel_session(self, session_id: str) -> dict:
        return {
            "id": session_id,
            "status": "CANCELLED"
        }

session_service = SessionService()
