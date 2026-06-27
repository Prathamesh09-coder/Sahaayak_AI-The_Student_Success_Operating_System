from langdetect import detect
import logging

logger = logging.getLogger(__name__)

SUPPORTED_LANGUAGES = {
    "en": "en",
    "hi": "hi",
    "mr": "mr",
    "ta": "ta",
    "te": "te",
    "kn": "kn",
    "gu": "gu",
    "bn": "bn"
}

def detect_language(text: str, default_lang: str = "en") -> str:
    """
    Detect the language of the transcribed text.
    Returns one of the supported language codes (en, hi, mr, ta, te, kn, gu, bn).
    Defaults to default_lang if detection fails or is unsupported.
    """
    if not text or len(text.strip()) < 3:
        return default_lang

    try:
        lang_code = detect(text)
        logger.info(f"[LanguageDetector] Detected raw language: {lang_code}")
        
        # Exact match
        if lang_code in SUPPORTED_LANGUAGES:
            return SUPPORTED_LANGUAGES[lang_code]
            
        # Fallback heuristic for Devanagari script (Hindi, Marathi)
        has_devanagari = any(ord(char) in range(0x0900, 0x0980) for char in text)
        if has_devanagari:
            # If default is already Hindi or Marathi, keep it; otherwise default to Hindi
            return default_lang if default_lang in ["hi", "mr"] else "hi"
            
        # Fallback heuristic for Tamil script (range U+0B80 to U+0BFF)
        has_tamil = any(ord(char) in range(0x0B80, 0x0C00) for char in text)
        if has_tamil:
            return "ta"
            
        # Fallback heuristic for Telugu script (range U+0C00 to U+0C7F)
        has_telugu = any(ord(char) in range(0x0C00, 0x0C80) for char in text)
        if has_telugu:
            return "te"

        return default_lang
    except Exception as e:
        logger.warning(f"[LanguageDetector] Language detection failed: {e}. Defaulting to {default_lang}")
        return default_lang
