class ParentGuidanceService:
    def explain_concept(self, topic: str, language: str) -> str:
        # Mock LLM generation logic
        # Instructions:
        # Explain in simple language.
        # Assume the parent has no technical background.
        # Respond in the parent's preferred language.
        
        responses = {
            "en": {
                "Placements": "Placements are events organized by colleges where companies visit to hire students directly before they graduate.",
                "Internships": "An internship is a short-term job where students learn how a real office works and get practical experience.",
                "Scholarships": "A scholarship is financial help given to students based on their grades or financial need, which they don't have to pay back."
            },
            "mr": {
                "Placements": "प्लेसमेंट्स म्हणजे कॉलेजमध्ये आयोजित केलेले कार्यक्रम जिथे कंपन्या विद्यार्थ्यांना थेट नोकरी देण्यासाठी येतात.",
                "Internships": "इंटर्नशिप म्हणजे एक छोटी नोकरी जिथे विद्यार्थ्यांना प्रत्यक्ष कामाचा अनुभव मिळतो.",
                "Scholarships": "शिष्यवृत्ती म्हणजे विद्यार्थ्यांना त्यांच्या गुणांच्या किंवा आर्थिक गरजेच्या आधारे मिळणारी आर्थिक मदत."
            }
        }
        
        # Default to English if language not found
        lang_responses = responses.get(language, responses["en"])
        return lang_responses.get(topic, f"Here is a simple explanation of {topic} in {language}.")

parent_guidance_service = ParentGuidanceService()
