import numpy as np

class SessionVADState:
    def __init__(self, threshold: float = 350.0, silence_timeout_ms: int = 1500, sample_rate: int = 16000):
        self.threshold = threshold
        self.silence_timeout_ms = silence_timeout_ms
        self.sample_rate = sample_rate
        self.bytes_per_second = sample_rate * 2  # 16-bit mono PCM = 2 bytes per sample
        
        self.speech_started = False
        self.silence_accumulated_bytes = 0
        self.audio_buffer = bytearray()

    def process_chunk(self, chunk: bytes) -> dict:
        """
        Process an incoming raw PCM chunk.
        Returns:
            dict containing:
            - voice_active: current speech status
            - speech_started: True if transition from silence to speech
            - speech_ended: True if transition from speech to silence (silence timeout met)
            - rms: root-mean-square energy level of the current chunk
        """
        if not chunk:
            return {"voice_active": False, "speech_started": False, "speech_ended": False, "rms": 0.0}

        samples = np.frombuffer(chunk, dtype=np.int16)
        if len(samples) == 0:
            return {"voice_active": False, "speech_started": False, "speech_ended": False, "rms": 0.0}

        rms = np.sqrt(np.mean(samples.astype(np.float32) ** 2))
        is_current_speech = rms > self.threshold

        just_started = False
        just_ended = False

        if is_current_speech:
            if not self.speech_started:
                self.speech_started = True
                just_started = True
            self.silence_accumulated_bytes = 0
            self.audio_buffer.extend(chunk)
        else:
            if self.speech_started:
                self.audio_buffer.extend(chunk)
                self.silence_accumulated_bytes += len(chunk)
                silence_ms = (self.silence_accumulated_bytes / self.bytes_per_second) * 1000
                if silence_ms >= self.silence_timeout_ms:
                    self.speech_started = False
                    just_ended = True
                    self.silence_accumulated_bytes = 0

        return {
            "voice_active": self.speech_started,
            "speech_started": just_started,
            "speech_ended": just_ended,
            "rms": float(rms)
        }

    def get_audio_and_clear(self) -> bytes:
        """Retrieve the accumulated audio buffer and clear it for the next utterance."""
        audio = bytes(self.audio_buffer)
        self.audio_buffer.clear()
        return audio
