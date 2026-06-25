from app.services.eligibility_service import eligibility_service
import uuid

class OpportunityService:
    async def match_student(self, student_profile: dict, opportunities: list[dict]) -> list[dict]:
        matches = []
        for opp in opportunities:
            reqs = {
                "required_skills": opp.get("required_skills", []),
                "minimum_cgpa": opp.get("minimum_cgpa", 0.0),
                "location": opp.get("location", ""),
                "is_remote": opp.get("is_remote", False)
            }
            eligibility = eligibility_service.calculate_eligibility(student_profile, reqs)
            
            readiness = "Ready"
            if eligibility["eligibility_score"] < 50:
                readiness = "Not Ready"
            elif eligibility["eligibility_score"] < 80:
                readiness = "Almost Ready"
                
            rec_actions = [f"Learn {skill}" for skill in eligibility["missing_requirements"]]
            
            matches.append({
                "opportunity": opp,
                "eligibility_score": eligibility["eligibility_score"],
                "missing_skills": eligibility["missing_requirements"],
                "readiness": readiness,
                "recommended_actions": rec_actions
            })
            
        # Sort by score descending
        matches.sort(key=lambda x: x["eligibility_score"], reverse=True)
        return matches

opportunity_service = OpportunityService()
