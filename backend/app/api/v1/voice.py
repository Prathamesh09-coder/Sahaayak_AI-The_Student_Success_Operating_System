import json
import base64
import logging
from fastapi import APIRouter, Depends, UploadFile, File, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db, AsyncSessionLocal
from app.services.voice_service import voice_service
from app.schemas.base import APIResponse

# Import new voice companion modules
from app.voice.voice_session_manager import voice_session_manager
from app.voice.audio_processor import pcm_to_wav
from app.voice.stt_service import transcribe_audio
from app.voice.language_detector import detect_language
from app.voice.emotion_service import detect_emotion_from_text, check_and_trigger_intervention
from app.voice.voice_mentor_service import generate_voice_mentor_response
from app.voice.tts_service import synthesize

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/transcribe", response_model=APIResponse)
async def transcribe(audio: UploadFile = File(...)):
    audio_data = await audio.read()
    # Replace mock transcription logic with our new real STT service
    result = await transcribe_audio(audio_data)
    text = result.get("text", "")
    return APIResponse(success=True, message="Audio transcribed", data={"transcript": text, "language": result.get("language")})

@router.post("/synthesize", response_model=APIResponse)
async def synthesize_http(text: str, language: str = "en"):
    # Replace mock TTS logic with our real synthesis service
    audio_data = await synthesize(text, language)
    base64_audio = base64.b64encode(audio_data).decode("utf-8")
    return APIResponse(
        success=True, 
        message="Speech synthesized", 
        data={"audio": base64_audio, "format": "mp3"}
    )

@router.post("/respond", response_model=APIResponse)
async def respond(audio: UploadFile = File(...), student_id: str = "default_student"):
    # Simulated full HTTP pipeline using real services
    audio_data = await audio.read()
    
    stt_result = await transcribe_audio(audio_data)
    transcript = stt_result.get("text", "")
    detected_lang = stt_result.get("language", "en")
    
    # We resolve the db session manually for the HTTP fallback
    async with AsyncSessionLocal() as db:
        response_text = await generate_voice_mentor_response(db, student_id, transcript, detected_lang)
        emotion = detect_emotion_from_text(transcript)
        await check_and_trigger_intervention(db, student_id, emotion, transcript)
        
        audio_bytes = await synthesize(response_text, detected_lang)
        base64_audio = base64.b64encode(audio_bytes).decode("utf-8")
        
    res = {
        "transcript": transcript, 
        "response_text": response_text,
        "emotion": emotion,
        "audio": base64_audio
    }
    return APIResponse(success=True, message="Voice response generated", data=res)

# --- WebSocket Real-Time Voice Gateway ---

@router.websocket("/ws/voice/{student_id}")
async def websocket_voice_endpoint(websocket: WebSocket, student_id: str):
    """
    Real-time bidirectional WebSocket Voice endpoint.
    Receives binary PCM audio chunks, processes VAD/endpointing,
    performs STT, runs the LLM/RAG mentor, translates, runs TTS,
    and returns base64-encoded audio chunks.
    """
    await websocket.accept()
    logger.info(f"[VoiceWS] Accepted connection from student: {student_id}")
    
    session = None
    db = AsyncSessionLocal()
    
    try:
        # First message must configure the session language
        initial_msg = await websocket.receive_text()
        try:
            data = json.loads(initial_msg)
            if data.get("event") == "start":
                lang = data.get("language", "en")
                session = await voice_session_manager.start_session(db, student_id, lang)
                logger.info(f"[VoiceWS] Started voice session {session.session_id} in {lang}")
                await websocket.send_json({"event": "ready", "session_id": session.session_id})
            else:
                await websocket.send_json({"event": "error", "message": "Expected start event"})
                await websocket.close()
                return
        except (json.JSONDecodeError, KeyError) as e:
            logger.error(f"[VoiceWS] Invalid initial message: {e}")
            await websocket.send_json({"event": "error", "message": "Invalid handshake"})
            await websocket.close()
            return
            
        # Main communication loop
        while True:
            # Check message type (text/json for controls, binary for PCM chunks)
            message = await websocket.receive()
            
            if "bytes" in message:
                pcm_chunk = message["bytes"]
                if not session:
                    continue
                
                # Feed chunk to session VAD
                vad_result = session.vad_state.process_chunk(pcm_chunk)
                
                # Check for start of speech
                if vad_result.get("speech_started"):
                    await websocket.send_json({"event": "listening", "speaking": True})
                    
                # Check for silence timeout/endpoint
                if vad_result.get("speech_ended"):
                    await websocket.send_json({"event": "processing"})
                    logger.info("[VoiceWS] Silence detected. Commencing transcription & generation...")
                    
                    # 1. Retrieve all accumulated PCM data
                    pcm_data = session.vad_state.get_audio_and_clear()
                    if not pcm_data:
                        await websocket.send_json({"event": "listening", "speaking": False})
                        continue
                        
                    # 2. Convert PCM to WAV bytes
                    wav_bytes = pcm_to_wav(pcm_data)
                    
                    # 3. Transcribe speech
                    stt_res = await transcribe_audio(wav_bytes)
                    transcript_text = stt_res.get("text", "").strip()
                    
                    if not transcript_text:
                        logger.info("[VoiceWS] Empty transcript. Ignoring noise.")
                        await websocket.send_json({"event": "listening", "speaking": False})
                        continue
                        
                    # 4. Detect language
                    lang_code = detect_language(transcript_text, default_lang=session.language)
                    logger.info(f"[VoiceWS] User: \"{transcript_text}\" (detected: {lang_code})")
                    
                    # Broadcast user transcript to frontend
                    await websocket.send_json({"event": "transcript", "text": transcript_text, "language": lang_code})
                    
                    # 5. Emotion and wellness checking
                    emotion = detect_emotion_from_text(transcript_text)
                    session.last_emotion = emotion
                    await websocket.send_json({"event": "emotion", "emotion": emotion})
                    await check_and_trigger_intervention(db, student_id, emotion, transcript_text)
                    
                    # 6. Generate AI response
                    session.messages_count += 1
                    response_text = await generate_voice_mentor_response(db, student_id, transcript_text, lang_code)
                    session.transcripts.append(f"Student: {transcript_text}")
                    session.transcripts.append(f"AI: {response_text}")
                    
                    # Send text response back immediately
                    await websocket.send_json({"event": "ai.response", "text": response_text})
                    
                    # 7. Synthesize to audio
                    audio_bytes = await synthesize(response_text, lang_code)
                    if audio_bytes:
                        base64_audio = base64.b64encode(audio_bytes).decode("utf-8")
                        await websocket.send_json({"event": "audio.chunk", "audio": base64_audio})
                        logger.info(f"[VoiceWS] Sent response audio. Text: \"{response_text}\"")
                    else:
                        logger.error("[VoiceWS] Failed to synthesize response audio.")
                        
                    await websocket.send_json({"event": "listening", "speaking": False})
                    
            elif "text" in message:
                try:
                    data = json.loads(message["text"])
                    event = data.get("event")
                    
                    if event == "stop":
                        logger.info("[VoiceWS] Received stop event from client.")
                        break
                    elif event == "language":
                        new_lang = data.get("language")
                        if new_lang in VOICE_MAP:
                            session.language = new_lang
                            logger.info(f"[VoiceWS] Switched language to {new_lang}")
                            await websocket.send_json({"event": "language.changed", "language": new_lang})
                except json.JSONDecodeError:
                    pass

    except WebSocketDisconnect:
        logger.info(f"[VoiceWS] Disconnected from student: {student_id}")
    except Exception as e:
        logger.exception(f"[VoiceWS] Error in voice websocket: {e}")
    finally:
        # Commit session metadata to database
        if session:
            await voice_session_manager.end_session(db, student_id)
            logger.info(f"[VoiceWS] Finalized and saved session: {session.session_id}")
        await db.close()
