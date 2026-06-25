from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Any
from app.models.success_index import SuccessIndex
from app.services.roadmap_service import resolve_student

class ExplainabilityService:
    async def get_explanations(self, db: AsyncSession, student_id: str) -> List[Dict[str, Any]]:
        """Generate logical, dynamic explanations of why a student's success score is where it is, and recommendations."""
        profile = await resolve_student(db, student_id)
        if not profile:
            return []

        result = await db.execute(
            select(SuccessIndex).where(SuccessIndex.student_id == profile.id)
        )
        idx = result.scalar_one_or_none()

        explanations = []

        if not idx:
            # Fallback default explanations
            return [
                {
                    "factor": "Low Career Readiness",
                    "impact": "High",
                    "reason": "No internship experience or active roadmap steps completed yet.",
                    "action": "Select a dream career and generate your AI roadmap route."
                }
            ]

        # Evaluate Academic standing
        if idx.academic_score < 75.0:
            explanations.append({
                "factor": "Academic Standings",
                "impact": "High",
                "reason": f"Your current CGPA ({profile.cgpa if profile.cgpa else 7.0}) is below the target threshold of 8.0.",
                "action": "Schedule an academic counseling session with your AI Mentor."
            })
        else:
            explanations.append({
                "factor": "Academic Excellence",
                "impact": "Medium",
                "reason": f"Superb CGPA of {profile.cgpa if profile.cgpa else 8.5} is boosting your readiness.",
                "action": "Maintain this level to qualify for elite corporate scholarships."
            })

        # Evaluate Career standing
        if idx.career_score < 75.0:
            explanations.append({
                "factor": "Low Career Readiness",
                "impact": "High",
                "reason": "No active summer internship applications or low roadmap step completions.",
                "action": "Apply for recommended internships and finish Month 1 roadmap steps."
            })

        # Evaluate Engagement standing
        if idx.engagement_score < 70.0:
            explanations.append({
                "factor": "Low Platform Engagement",
                "impact": "Medium",
                "reason": "Fewer study check-ins and mentor chats logged over the past week.",
                "action": "Perform a weekly check-in chat with your Digital Twin."
            })

        # Evaluate Social Capital
        if idx.social_capital_score < 60.0:
            explanations.append({
                "factor": "Social Capital Gap",
                "impact": "Medium",
                "reason": "Low participation in peer group discussions and study communities.",
                "action": "Join a technical community group in the Community tab."
            })

        return explanations

    async def generate_improvement_plan(self, db: AsyncSession, student_id: str) -> List[Dict[str, Any]]:
        """Generate actionable improvement recommendations for the student success index."""
        exps = await self.get_explanations(db, student_id)
        
        recs = []
        for e in exps:
            priority = "HIGH" if e["impact"] == "High" else "MEDIUM"
            recs.append({
                "title": e["action"],
                "priority": priority,
                "reason": f"Because your {e['factor'].lower()} requires optimization."
            })
            
        return recs

explainability_service = ExplainabilityService()
