from app.services.eligibility_service import eligibility_service
import uuid

class ScholarshipService:
    async def match_student(self, student_profile: dict, scholarships: list[dict]) -> list[dict]:
        matches = []
        for scholarship in scholarships:
            eligibility = eligibility_service.calculate_eligibility(
                student_profile, 
                scholarship.get("eligibility_criteria", {})
            )
            
            matches.append({
                "scholarship": scholarship,
                "eligibility_score": eligibility["eligibility_score"],
                "is_eligible": eligibility["is_eligible"],
                "missing_requirements": eligibility["missing_requirements"]
            })
            
        # Sort by score descending
        matches.sort(key=lambda x: x["eligibility_score"], reverse=True)
        return matches

scholarship_service = ScholarshipService()
