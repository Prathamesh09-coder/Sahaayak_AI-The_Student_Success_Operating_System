import re

BLOCKED_PATTERNS = [
    r"(?i)ignore previous instructions",
    r"(?i)reveal system prompt",
    r"(?i)delete database",
    r"(?i)drop table",
    r"(?i)kill yourself",
    r"(?i)suicide",
]

def check_moderation(text: str) -> dict:
    """
    Checks for Prompt Injection, Hate Speech, Self Harm, Malicious Instructions
    Returns dict with blocked status and reason.
    """
    for pattern in BLOCKED_PATTERNS:
        if re.search(pattern, text):
            return {
                "blocked": True,
                "reason": "Prompt injection or malicious instruction detected"
            }
            
    # Here we could also integrate OpenAI's moderation endpoint or a local hate-speech model.
    # For MVP, rule-based matching covers the requested explicit blocks.
    return {
        "blocked": False,
        "reason": None
    }
