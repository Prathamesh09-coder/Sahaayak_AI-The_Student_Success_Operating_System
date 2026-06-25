class CommunityService:
    def get_suggested_groups(self, student: dict) -> list:
        # Based on Career Goal, Interests, Roadmap, Skills
        return [
            {
                "id": "g1",
                "name": "Machine Learning Aspirants",
                "member_count": 1250,
                "reason": "Matches your career goal"
            },
            {
                "id": "g2",
                "name": "First Generation Learners",
                "member_count": 3400,
                "reason": "Based on your background"
            }
        ]
        
    def get_trending_topics(self) -> list:
        # Calculate using Likes, Comments, Recent Activity
        return [
            {"topic": "#Gate2027Prep", "posts": 342},
            {"topic": "#TCSNinjaTips", "posts": 210},
            {"topic": "#ReactInterview", "posts": 185}
        ]

community_service = CommunityService()
