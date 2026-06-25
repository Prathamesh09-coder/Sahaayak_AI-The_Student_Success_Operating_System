class EligibilityService:
    def calculate_eligibility(self, student_profile: dict, opportunity_requirements: dict) -> dict:
        """
        Skills               30%
        CGPA                 20%
        Career Fit           15%
        Confidence           10%
        Income Match         10%
        Location Match        5%
        Language Match        5%
        Remote Preference     5%
        """
        score = 0
        missing_skills = []
        
        # Skills (30%)
        required_skills = set(opportunity_requirements.get("required_skills", []))
        student_skills = set(student_profile.get("skills", []))
        if required_skills:
            intersection = required_skills.intersection(student_skills)
            skill_score = (len(intersection) / len(required_skills)) * 30
            score += skill_score
            missing_skills = list(required_skills - student_skills)
        else:
            score += 30

        # CGPA (20%)
        req_cgpa = opportunity_requirements.get("minimum_cgpa", 0.0)
        stud_cgpa = student_profile.get("cgpa", 0.0)
        if stud_cgpa >= req_cgpa:
            score += 20
        elif req_cgpa > 0:
            score += max(0, (stud_cgpa / req_cgpa) * 20)

        # Career Fit (15%) - Mock logic
        score += 15
        
        # Confidence (10%) - Mock logic
        score += 8
        
        # Income Match (10%) - Mock logic
        score += 10
        
        # Location Match (5%)
        req_loc = opportunity_requirements.get("location", "").lower()
        stud_loc = student_profile.get("location", "").lower()
        if not req_loc or req_loc == stud_loc:
            score += 5
            
        # Language Match (5%) - Mock logic
        score += 5
        
        # Remote Preference (5%)
        if opportunity_requirements.get("is_remote") == student_profile.get("prefers_remote", False):
            score += 5
            
        return {
            "eligibility_score": round(score, 2),
            "is_eligible": score >= 70, # Arbitrary threshold
            "missing_requirements": missing_skills
        }

eligibility_service = EligibilityService()
