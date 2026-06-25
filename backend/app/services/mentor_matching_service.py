class MentorMatchingService:
    def calculate_match_score(self, student: dict, mentor: dict) -> dict:
        # Career Alignment      30%
        # Skill Match           25%
        # Background Similarity 15%
        # Language Match        15%
        # Location Match        10%
        # Availability Match     5%
        
        score = 0
        reasons = []
        
        if student.get("career_goal") == mentor.get("career_goal"):
            score += 30
            reasons.append("Same career goal")
            
        student_skills = set(student.get("skills", []))
        mentor_skills = set(mentor.get("skills", []))
        common_skills = student_skills.intersection(mentor_skills)
        if len(common_skills) > 0:
            score += min(len(common_skills) * 5, 25)
            reasons.append("Shared skills")
            
        # Background similarity (First Gen, Rural/Urban, Income)
        if student.get("is_first_generation") and mentor.get("is_first_generation"):
            score += 15
            reasons.append("First-generation background")
            
        student_langs = set(student.get("languages", []))
        mentor_langs = set(mentor.get("languages", []))
        if len(student_langs.intersection(mentor_langs)) > 0:
            score += 15
            reasons.append("Same language")
            
        if student.get("location") == mentor.get("location"):
            score += 10
            reasons.append("Same location")
            
        score += 5 # Mock availability match
        
        return {
            "mentor_id": mentor.get("id"),
            "mentor_name": mentor.get("name"),
            "designation": mentor.get("designation"),
            "company": mentor.get("company"),
            "match_score": score,
            "reason": ", ".join(reasons)
        }

    async def get_recommended_mentors(self, student: dict, mentors: list) -> list:
        results = [self.calculate_match_score(student, m) for m in mentors]
        return sorted(results, key=lambda x: x["match_score"], reverse=True)

mentor_matching_service = MentorMatchingService()
