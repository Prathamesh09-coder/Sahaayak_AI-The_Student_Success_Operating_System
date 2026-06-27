from langdetect import detect
from app.llm.ollama_client import generate
import logging

logger = logging.getLogger(__name__)

LANG_NAMES = {
    "en": "English",
    "hi": "Hindi",
    "mr": "Marathi",
    "ta": "Tamil",
    "te": "Telugu",
    "kn": "Kannada",
    "gu": "Gujarati",
    "bn": "Bengali",
    "ml": "Malayalam",
    "pa": "Punjabi",
    "or": "Odia"
}

def detect_language(text: str) -> str:
    """Detect the language of the input text."""
    try:
        lang = detect(text)
        return lang
    except Exception:
        return "en"

def requires_translation(lang_code: str) -> bool:
    """Return True if the language is not English and needs translation."""
    return lang_code != "en"

async def translate_to_english(text: str, source_lang: str) -> str:
    """Translate user queries from the source language to English."""
    if source_lang == "en":
        return text
        
    source_name = LANG_NAMES.get(source_lang, source_lang)
    logger.info(f"[LanguageService] Translating query from {source_name} to English...")
    
    prompt = (
        f"You are a translation assistant. Translate the following text from {source_name} to English.\n"
        f"Output ONLY the direct translated text and nothing else. Do not add quotes, comments, or explanations.\n\n"
        f"Text:\n{text}"
    )
    try:
        result = await generate(prompt=prompt, system="You are an expert translator.")
        cleaned = result.strip().strip('"').strip("'")
        logger.info(f"[LanguageService] Translation success: {cleaned}")
        return cleaned
    except Exception as e:
        logger.error(f"[LanguageService] Translation to English failed: {e}")
        return text

async def translate_from_english(text: str, target_lang: str) -> str:
    """Translate English system responses back into the user's target language."""
    if target_lang == "en":
        return text
        
    target_name = LANG_NAMES.get(target_lang, target_lang)
    logger.info(f"[LanguageService] Translating response from English to {target_name}...")
    
    prompt = (
        f"You are a translation assistant. Translate the following English text into {target_name}.\n"
        f"Output ONLY the direct translated text and nothing else. Do not add quotes, comments, or explanations.\n\n"
        f"Text:\n{text}"
    )
    try:
        result = await generate(prompt=prompt, system="You are an expert translator.")
        cleaned = result.strip().strip('"').strip("'")
        logger.info(f"[LanguageService] Translation success: {cleaned}")
        return cleaned
    except Exception as e:
        logger.error(f"[LanguageService] Translation from English failed: {e}")
        return text
