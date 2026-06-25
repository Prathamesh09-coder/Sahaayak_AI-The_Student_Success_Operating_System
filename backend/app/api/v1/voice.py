from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.voice_service import voice_service
from app.schemas.base import APIResponse

router = APIRouter()

@router.post("/transcribe", response_model=APIResponse)
async def transcribe(audio: UploadFile = File(...)):
    audio_data = await audio.read()
    text = voice_service.transcribe_audio(audio_data)
    return APIResponse(success=True, message="Audio transcribed", data={"transcript": text})

@router.post("/synthesize", response_model=APIResponse)
async def synthesize(text: str, language: str = "en"):
    audio_data = voice_service.generate_audio(text, language)
    return APIResponse(success=True, message="Speech synthesized", data={"status": "success"})

@router.post("/respond", response_model=APIResponse)
async def respond(audio: UploadFile = File(...)):
    # Simulates full pipeline
    audio_data = await audio.read()
    transcript = voice_service.transcribe_audio(audio_data)
    # mock logic for AI response
    response_text = f"Simulated response for: {transcript}"
    res = {"transcript": transcript, "response_audio_url": "/mock/audio.mp3", "response_text": response_text}
    return APIResponse(success=True, message="Voice response generated", data=res)
