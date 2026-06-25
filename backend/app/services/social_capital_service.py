class SocialCapitalService:
    def calculate_score(self, student_data: dict) -> dict:
        # Mock calculation based on:
        # Mentor Connections      30%
        # Peer Connections        20%
        # Community Participation 20%
        # Sessions Completed      20%
        # Success Stories Shared  10%
        
        mentor_conns = min(student_data.get("mentor_connections", 0) * 10, 30)
        peer_conns = min(student_data.get("peer_connections", 0) * 4, 20)
        community_part = min(student_data.get("community_posts", 0) * 2, 20)
        sessions_comp = min(student_data.get("sessions_completed", 0) * 5, 20)
        stories_shared = min(student_data.get("stories_shared", 0) * 10, 10)
        
        score = mentor_conns + peer_conns + community_part + sessions_comp + stories_shared
        
        strength = "Weak"
        if score > 70:
            strength = "Strong"
        elif score > 40:
            strength = "Moderate"
            
        return {
            "score": score,
            "strength": strength
        }

social_capital_service = SocialCapitalService()
