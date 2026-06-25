class SafetyService:
    def check_query(self, query: str) -> dict:
        # Basic heuristic for MVP
        unsafe_keywords = ["suicide", "kill myself", "harm myself", "hack the system", "jailbreak"]
        query_lower = query.lower()
        for kw in unsafe_keywords:
            if kw in query_lower:
                if "suicide" in kw or "harm" in kw:
                    return {
                        "is_safe": False, 
                        "reason": "self_harm", 
                        "response": "If you are in distress, please call the national mental health helpline or reach out to a trusted counselor. You are not alone."
                    }
                return {
                    "is_safe": False, 
                    "reason": "policy_violation", 
                    "response": "I cannot fulfill this request as it violates the safety policy."
                }
        return {"is_safe": True}

safety_service = SafetyService()
