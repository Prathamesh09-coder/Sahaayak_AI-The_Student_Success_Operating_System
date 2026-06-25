class AccessibilityService:
    def generate_accessibility_preferences(self, student_id: str) -> dict:
        return {
            "theme": "DARK",
            "contrast": "HIGH",
            "text_size": "LARGE",
            "reduced_motion": True,
            "screen_reader_friendly": True
        }
        
    def recommend_ui_mode(self, digital_literacy_level: str) -> str:
        if digital_literacy_level == "LOW":
            return "LOW_LITERACY"
        return "STANDARD"

accessibility_service = AccessibilityService()
