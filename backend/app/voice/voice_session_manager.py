import uuid
import time
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.voice_session import VoiceSession
from app.voice.vad_service import SessionVADState

class ActiveVoiceSession:
    def __init__(self, student_id: str, language: str):
        self.session_id = str(uuid.uuid4())
        self.student_id = student_id
        self.language = language
        self.start_time = time.time()
        self.messages_count = 0
        self.transcripts = []
        self.last_emotion = "neutral"
        # Instantiate VAD State for this session
        self.vad_state = SessionVADState(threshold=300, silence_timeout_ms=1500)

class VoiceSessionManager:
    def __init__(self):
        self.active_sessions = {}  # student_id -> ActiveVoiceSession

    async def start_session(self, db: AsyncSession, student_id: str, language: str) -> ActiveVoiceSession:
        """Initialize a new active voice session and persist it to the database."""
        # Clean up any stale session
        if student_id in self.active_sessions:
            await self.end_session(db, student_id)
            
        session = ActiveVoiceSession(student_id, language)
        self.active_sessions[student_id] = session
        
        # Persist session start to database
        db_session = VoiceSession(
            id=session.session_id,
            student_id=student_id,
            conversation_id=str(uuid.uuid4()),
            language=language,
            duration_seconds=0,
            messages_count=0,
            started_at=datetime.utcnow(),
            status="active",
            emotion="neutral"
        )
        db.add(db_session)
        await db.commit()
        
        return session

    def get_session(self, student_id: str) -> ActiveVoiceSession:
        """Fetch the current active session memory for the student."""
        return self.active_sessions.get(student_id)

    async def end_session(self, db: AsyncSession, student_id: str):
        """Finalize the active session, calculate duration, persist metrics, and clean up memory."""
        session = self.active_sessions.pop(student_id, None)
        if not session:
            return
            
        duration = int(time.time() - session.start_time)
        full_transcript = "\n".join(session.transcripts)
        
        result = await db.execute(select(VoiceSession).where(VoiceSession.id == session.session_id))
        db_session = result.scalar_one_or_none()
        
        if db_session:
            db_session.duration_seconds = duration
            db_session.messages_count = session.messages_count
            db_session.ended_at = datetime.utcnow()
            db_session.transcript = full_transcript if full_transcript else "No conversation recorded"
            db_session.emotion = session.last_emotion
            db_session.status = "completed"
            db.add(db_session)
            await db.commit()
            
        return duration

voice_session_manager = VoiceSessionManager()
