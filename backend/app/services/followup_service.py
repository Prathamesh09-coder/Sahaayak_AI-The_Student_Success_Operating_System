import re
from typing import List

# In a full LLM pipeline, this would extract bullets or numbers from the end of the LLM's response,
# or hit a separate lightweight completion call. For MVP, we can infer from the response text.

def generate_followups(assistant_response: str) -> List[str]:
    """
    Generate 3 actionable follow-ups based on the AI's response.
    """
    # Placeholder logic - ideally generated via LLM structured JSON output.
    followups = []
    
    lower_res = assistant_response.lower()
    
    if "scholarship" in lower_res:
        followups.append("Show scholarships for me")
    if "career" in lower_res or "skills" in lower_res:
        followups.append("Create a roadmap")
    if "internship" in lower_res or "job" in lower_res:
        followups.append("Find internships")
        
    if not followups:
        followups = ["Tell me more about this", "What are my next steps?"]
        
    return followups[:3]
