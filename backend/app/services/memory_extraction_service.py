import re
from typing import List, Dict

# Example of a highly deterministic, fast extraction mechanism.
# In prod, you'd likely use an LLM function calling / structured output for this.

EXTRACTION_PATTERNS = {
    "dream_career": r"(?i)I want to become an? ([\w\s]+)",
    "weak_subjects": r"(?i)I am weak in ([\w\s]+)",
    "preferred_language": r"(?i)I prefer speaking in ([\w\s]+)",
}

async def extract_memory(user_message: str) -> List[Dict[str, str]]:
    """
    Returns a list of persistent memory objects to store in StudentMemory DB.
    """
    extracted = []
    
    for key, pattern in EXTRACTION_PATTERNS.items():
        match = re.search(pattern, user_message)
        if match:
            value = match.group(1).strip()
            # Clean up trailing punctuation if necessary
            value = re.sub(r'[^\w\s]', '', value)
            extracted.append({
                "memory_key": key,
                "memory_value": value
            })
            
    return extracted
