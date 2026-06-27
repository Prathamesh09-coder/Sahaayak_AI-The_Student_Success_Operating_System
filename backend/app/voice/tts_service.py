import edge_tts
import logging

logger = logging.getLogger(__name__)

VOICE_MAP = {
    "en": "en-US-AriaNeural",
    "hi": "hi-IN-SwaraNeural",
    "mr": "mr-IN-AarohiNeural",
    "ta": "ta-IN-PallaviNeural",
    "te": "te-IN-ShrutiNeural",
    "kn": "kn-IN-SapnaNeural",
    "gu": "gu-IN-DhwaniNeural",
    "bn": "bn-IN-TanishaNeural"
}

async def synthesize(text: str, language: str) -> bytes:
    """
    Synthesize text to speech audio bytes using edge-tts.
    Supports English, Hindi, Marathi, Tamil, Telugu, Kannada, Gujarati, and Bengali.
    """
    voice = VOICE_MAP.get(language, "en-US-AriaNeural")
    logger.info(f"[TTS] Synthesizing text using voice {voice} for language {language}...")
    
    try:
        # Create Communicate instance
        communicate = edge_tts.Communicate(text, voice)
        
        audio_data = bytearray()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_data.extend(chunk["data"])
                
        logger.info(f"[TTS] Successfully synthesized {len(audio_data)} bytes of audio.")
        return bytes(audio_data)
        
    except Exception as e:
        logger.exception(f"[TTS] Failed to synthesize audio using edge-tts: {e}")
        # Return empty bytes on failure to prevent crashes
        return b""
