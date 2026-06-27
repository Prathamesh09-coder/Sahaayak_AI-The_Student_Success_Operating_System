import logging
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.context_service import load_student_context
from app.rag.retrieval_service import retrieve_context
from app.llm.ollama_client import generate

logger = logging.getLogger(__name__)

# Primary and secondary language mapping names
LANG_NAMES = {
    "en": "English",
    "hi": "Hindi",
    "mr": "Marathi",
    "ta": "Tamil",
    "te": "Telugu",
    "kn": "Kannada",
    "gu": "Gujarati",
    "bn": "Bengali"
}

async def translate_text(text: str, source_lang: str, target_lang: str) -> str:
    """
    Translate text between English and Indian languages using the LLM (NVIDIA Qwen or Ollama).
    """
    if source_lang == target_lang:
        return text

    source_name = LANG_NAMES.get(source_lang, source_lang)
    target_name = LANG_NAMES.get(target_lang, target_lang)
    
    logger.info(f"[VoiceMentor] Translating text from {source_name} to {target_name} via LLM...")

    prompt = (
        f"You are a professional translation model. Translate the following text from {source_name} to {target_name}.\n"
        f"Output ONLY the translated text and absolutely nothing else. Do not add quotes, introductory text, "
        f"or explanations.\n\n"
        f"Text to translate:\n{text}"
    )

    try:
        translated = await generate(prompt=prompt, system="You are an expert multilingual translator.")
        # Perform minor formatting cleaning
        cleaned = translated.strip().strip('"').strip("'")
        return cleaned
    except Exception as e:
        logger.error(f"[VoiceMentor] Translation failed: {e}")
        return text

async def generate_voice_mentor_response(
    db: AsyncSession, 
    student_id: str, 
    user_transcript: str, 
    detected_lang: str
) -> str:
    """
    Orchestrate the AI Mentor's reasoning process:
    1. Translate secondary languages to English for RAG and LLM alignment.
    2. Load student profile and Digital Twin context.
    3. Retrieve relevant documents using RAG (ChromaDB).
    4. Generate response using Qwen/Llama with custom empathetic guidelines.
    5. Translate response back to the user's detected language.
    """
    secondary_langs = ["ta", "te", "kn", "gu", "bn"]
    english_query = user_transcript
    
    # Step 1: Translate to English if secondary language
    if detected_lang in secondary_langs:
        english_query = await translate_text(user_transcript, source_lang=detected_lang, target_lang="en")
        logger.info(f"[VoiceMentor] Translated secondary input into English: {english_query}")

    # Step 2: Load student context
    try:
        student_context = await load_student_context(db, student_id)
    except Exception as e:
        logger.error(f"[VoiceMentor] Failed to load student context: {e}")
        student_context = {
            "dream_career": "Student",
            "cgpa": "N/A",
            "financial_status": "Stable",
            "skills": []
        }

    # Step 3: RAG Retrieval from ChromaDB
    try:
        rag_results = retrieve_context(
            query=english_query,
            collections=["scholarships", "careers", "government_schemes", "courses", "success_stories"],
            top_k=3
        )
        rag_context_str = "\n\n".join([
            f"Source [{doc['collection']}]:\n{doc['content']}"
            for doc in rag_results
        ])
    except Exception as e:
        logger.error(f"[VoiceMentor] RAG retrieval failed: {e}")
        rag_context_str = "No specific resources found."

    # Step 4: Construct system prompt for voice companion
    system_prompt = (
        "You are Sahaayak AI Voice Mentor, an empathetic, conversational, and direct voice assistant for first-generation university students.\n"
        "Speech Guidelines:\n"
        "- Speak directly. Responses MUST be short, simple, and conversational (1-3 sentences max).\n"
        "- Keep it empathetic, warm, and supportive.\n"
        "- Avoid formatting: DO NOT use asterisks, lists, markdown bold, headers, or quotes since this is read aloud.\n"
        "- Do not include complex URLs or email addresses. Keep it simple.\n\n"
        f"Student Context:\n"
        f"- Target Career: {student_context.get('dream_career')}\n"
        f"- CGPA: {student_context.get('cgpa')}\n"
        f"- Financial Status: {student_context.get('financial_status')}\n"
        f"- Current Skills: {', '.join(student_context.get('skills', [])) if student_context.get('skills') else 'None'}\n\n"
        f"Relevant Resource Context (RAG):\n"
        f"{rag_context_str}\n"
    )

    logger.info(f"[VoiceMentor] Generating response with prompt system...")
    try:
        english_response = await generate(prompt=english_query, system=system_prompt)
        # Post-process response to remove text formatting artifacts
        english_response = english_response.replace("*", "").replace('"', '').strip()
    except Exception as e:
        logger.exception(f"[VoiceMentor] LLM generation failed: {e}")
        english_response = "I am having trouble connecting to my brain right now. Can you try again?"

    logger.info(f"[VoiceMentor] English response generated: {english_response}")

    # Step 5: Translate final output to user language if not English
    final_response = english_response
    if detected_lang != "en":
        final_response = await translate_text(english_response, source_lang="en", target_lang=detected_lang)
        logger.info(f"[VoiceMentor] Translated output to {detected_lang}: {final_response}")

    return final_response
