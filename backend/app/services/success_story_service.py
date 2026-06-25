class SuccessStoryService:
    def get_recommended_stories(self, student: dict) -> list:
        # Surface stories based on:
        # Career Goal
        # Language
        # Background
        # Financial Situation
        
        # Mock calculation of similarity_score
        return [
            {
                "id": "story1",
                "title": "From Rural Maharashtra to Google",
                "story": "Student from rural Maharashtra learned Python and got an internship at TCS, then Google.",
                "career_outcome": "Software Engineer",
                "company": "Google",
                "similarity_score": 92,
                "featured": True
            },
            {
                "id": "story2",
                "title": "Breaking into ML without a Tier-1 college",
                "story": "Focused on Kaggle and open source contributions.",
                "career_outcome": "ML Engineer",
                "company": "NVIDIA",
                "similarity_score": 85,
                "featured": False
            }
        ]

success_story_service = SuccessStoryService()
