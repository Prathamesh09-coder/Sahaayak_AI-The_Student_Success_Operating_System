from langdetect import detect
from typing import Tuple

# Language Layer Logic
NATIVE_SUPPORTED = ["en", "hi", "mr"]
INDIC_TRANS2_SUPPORTED = ["ta", "te", "kn", "gu", "bn", "ml", "pa", "or"]

def detect_language(text: str) -> str:
    try:
        lang = detect(text)
        # map common iso codes to our expected codes
        return lang
    except:
        return "en"

def requires_translation(lang_code: str) -> bool:
    return lang_code not in NATIVE_SUPPORTED

async def translate_to_english(text: str, source_lang: str) -> str:
    # Placeholder for IndicTrans2 API / Model call
    # For MVP, returns original text. In prod, hits translation endpoint.
    return text

async def translate_from_english(text: str, target_lang: str) -> str:
    # Placeholder for IndicTrans2 API / Model call
    return text
