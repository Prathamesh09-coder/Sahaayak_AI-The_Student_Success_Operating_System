import logging
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.intervention import Intervention, InterventionCategory
from app.services.roadmap_service import resolve_student

logger = logging.getLogger(__name__)

# Heuristic keywords for emotion detection
SAD_KEYWORDS = ["sad", "depressed", "lonely", "unhappy", "cry", "crying", "hurt", "grief", "broken", "hopeless", "उदासी", "दुख", "एकला"]
STRESSED_KEYWORDS = ["stress", "stressed", "anxious", "anxiety", "exam", "exams", "pressure", "burnout", "overwhelmed", "panic", "worried", "worry", "tension", "डर", "तनाव", "चिंता"]
HAPPY_KEYWORDS = ["happy", "glad", "joy", "excited", "good", "great", "awesome", "wonderful", "celebrate", "खुश", "आनंद", "अच्छा"]
CONFUSED_KEYWORDS = ["confused", "doubt", "uncertain", "puzzled", "what to do", "lost", "understand", "not sure", "असमंजस", "समझ"]

def detect_emotion_from_text(text: str) -> str:
    """
    Perform lexical keyword analysis on user speech text to identify emotion.
    Returns: happy, sad, stressed, confused, or neutral.
    """
    if not text:
        return "neutral"
        
    text_lower = text.lower()
    
    # Check stressed keywords
    if any(word in text_lower for word in STRESSED_KEYWORDS):
        return "stressed"
        
    # Check sad keywords
    if any(word in text_lower for word in SAD_KEYWORDS):
        return "sad"
        
    # Check confused keywords
    if any(word in text_lower for word in CONFUSED_KEYWORDS):
        return "confused"
        
    # Check happy keywords
    if any(word in text_lower for word in HAPPY_KEYWORDS):
        return "happy"
        
    return "neutral"

async def check_and_trigger_intervention(db: AsyncSession, student_id: str, emotion: str, transcript: str):
    """
    If emotion is sad or stressed, trigger a wellness intervention via the InterventionService.
    """
    if emotion not in ["sad", "stressed"]:
        return

    logger.info(f"[EmotionService] Detected risk emotion '{emotion}'. Triggering wellness intervention...")
    try:
        profile = await resolve_student(db, student_id)
        if not profile:
            logger.warning(f"[EmotionService] Could not find student profile for student_id: {student_id}")
            return
            
        student_profile_id = str(profile.id)
        
        # Avoid creating duplicate pending interventions for the same voice emotion alert
        from sqlalchemy import select
        existing = await db.execute(
            select(Intervention).where(
                Intervention.student_id == student_profile_id,
                Intervention.status == "PENDING",
                Intervention.trigger_source == f"VOICE_EMOTION_{emotion.upper()}"
            )
        )
        if existing.scalars().first():
            logger.info("[EmotionService] Wellness intervention for this emotion is already pending.")
            return

        reason = (
            f"Voice Companion alert: Student expressed feeling {emotion} during voice mentorship. "
            f"Key transcript: \"{transcript[:150]}\""
        )
        
        intervention = Intervention(
            id=str(uuid.uuid4()),
            student_id=student_profile_id,
            type=InterventionCategory.MENTAL_WELLNESS,
            severity="MEDIUM",
            reason=reason,
            recommended_action="Schedule a friendly chat with the AI Mentor or access our mental wellness support page.",
            status="PENDING",
            risk_score=75.0 if emotion == "stressed" else 80.0,
            trigger_source=f"VOICE_EMOTION_{emotion.upper()}",
            is_auto_generated=True
        )
        
        db.add(intervention)
        await db.commit()
        logger.info(f"[EmotionService] Logged wellness intervention for student {student_profile_id}.")
        
    except Exception as e:
        logger.exception(f"[EmotionService] Failed to trigger intervention: {e}")
