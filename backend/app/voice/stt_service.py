import os
import io
import logging
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)

_local_model = None

def get_local_model():
    """Lazily initialize the local faster-whisper model on CPU."""
    global _local_model
    if _local_model is None:
        logger.info("[STT] Initializing local faster-whisper 'tiny' model on CPU...")
        from faster_whisper import WhisperModel
        # Use 'tiny' for speed and memory efficiency on standard CPU environments
        _local_model = WhisperModel("tiny", device="cpu", compute_type="int8")
        logger.info("[STT] Local faster-whisper model loaded successfully.")
    return _local_model

async def transcribe_audio(audio_bytes: bytes) -> dict:
    """
    Transcribe WAV audio bytes to text.
    First tries OpenAI Whisper API if OPENAI_API_KEY is configured.
    Otherwise, falls back to local faster-whisper running on CPU.
    """
    openai_key = os.environ.get("OPENAI_API_KEY")
    if openai_key:
        logger.info("[STT] Attempting transcription via OpenAI Whisper API...")
        try:
            client = AsyncOpenAI(api_key=openai_key)
            audio_file = io.BytesIO(audio_bytes)
            audio_file.name = "audio.wav"
            
            response = await client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file
            )
            return {
                "text": response.text,
                "language": "en"  # Standard API does not return language code directly, default to English context
            }
        except Exception as e:
            logger.error(f"[STT] OpenAI Whisper API call failed: {e}. Falling back to local model.")

    # Fallback to local faster-whisper
    try:
        logger.info("[STT] Running transcription locally via faster-whisper...")
        model = get_local_model()
        audio_file = io.BytesIO(audio_bytes)
        
        segments, info = model.transcribe(audio_file, beam_size=3)
        text = " ".join([segment.text for segment in segments]).strip()
        
        logger.info(f"[STT] Local transcription completed. Language: {info.language}, Text: {text}")
        return {
            "text": text,
            "language": info.language
        }
    except Exception as e:
        logger.exception(f"[STT] Local faster-whisper transcription failed: {e}")
        return {
            "text": "",
            "language": "en"
        }
