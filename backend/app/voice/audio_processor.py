import struct

def pcm_to_wav(pcm_data: bytes, sample_rate: int = 16000, sample_width: int = 2, channels: int = 1) -> bytes:
    """
    Wrap raw PCM audio bytes with a standard RIFF/WAV 44-byte header.
    Default parameters assume 16kHz, 16-bit mono PCM.
    """
    header = bytearray(44)
    # RIFF descriptor
    struct.pack_into('<4s', header, 0, b'RIFF')
    struct.pack_into('<I', header, 4, 36 + len(pcm_data))
    struct.pack_into('<4s', header, 8, b'WAVE')
    
    # fmt subchunk
    struct.pack_into('<4s', header, 12, b'fmt ')
    struct.pack_into('<I', header, 16, 16)  # Chunk size
    struct.pack_into('<H', header, 20, 1)   # Audio format (1 = uncompressed PCM)
    struct.pack_into('<H', header, 22, channels)
    struct.pack_into('<I', header, 24, sample_rate)
    struct.pack_into('<I', header, 28, sample_rate * channels * sample_width)  # Byte rate
    struct.pack_into('<H', header, 32, channels * sample_width)  # Block align
    struct.pack_into('<H', header, 34, sample_width * 8)         # Bits per sample
    
    # data subchunk
    struct.pack_into('<4s', header, 36, b'data')
    struct.pack_into('<I', header, 40, len(pcm_data))
    
    return bytes(header) + pcm_data
