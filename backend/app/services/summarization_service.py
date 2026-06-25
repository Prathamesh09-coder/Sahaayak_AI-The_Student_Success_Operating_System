from typing import List, Dict
import json
# For now, we will use a naive rule-based summarization or simple prompt.
# In the 16-step pipeline, if > 20 messages, we call this and use the LLM to summarize.

async def generate_summary(conversation_history: List[Dict[str, str]]) -> str:
    """
    Called by MentorService when conversation length > 20.
    In a full implementation, this sends the history to an LLM with:
    "Summarize the user's core interests, weaknesses, and needs from this conversation."
    """
    # Placeholder logic for MVP
    return "Student discussed their career goals and needs scholarship guidance."
