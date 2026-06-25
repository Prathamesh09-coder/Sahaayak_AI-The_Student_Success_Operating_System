class VoiceService:
    def transcribe_audio(self, audio_data: bytes) -> str:
        # Mock STT using faster-whisper concept
        return "Can you tell me about scholarships?"

    def generate_audio(self, text: str, language: str) -> bytes:
        # Mock TTS using edge-tts concept
        return b"mock_audio_bytes_generated_for_" + text.encode('utf-8')

voice_service = VoiceService()
