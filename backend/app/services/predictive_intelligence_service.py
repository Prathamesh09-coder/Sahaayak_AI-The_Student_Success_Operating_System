from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Any, Optional
from app.models.predictive_insight import PredictiveInsight
from app.models.success_index import SuccessIndex
from app.models.student_profile import StudentProfile
import uuid
import logging

logger = logging.getLogger(__name__)

class PredictiveIntelligenceService:
    async def get_student_predictions(self, db: AsyncSession, student_profile_id: str) -> Dict[str, Any]:
        """Fetch current predictive insights from the database. Calculate and save if none exist."""
        result = await db.execute(
            select(PredictiveInsight).where(PredictiveInsight.student_id == student_profile_id)
        )
        insights = result.scalars().all()

        if not insights:
            # Generate and save fresh insights
            await self.run_predictions_and_save(db, student_profile_id)
            # Re-fetch
            result = await db.execute(
                select(PredictiveInsight).where(PredictiveInsight.student_id == student_profile_id)
            )
            insights = result.scalars().all()

        # Format to match API contract:
        # { "dropout_risk": X, "placement_probability": Y, ... }
        response = {
            "dropout_risk": 15,
            "placement_probability": 75,
            "financial_risk": 20,
            "burnout_risk": 25,
            "scholarship_probability": 80
        }

        for insight in insights:
            val = int(insight.confidence * 100)
            if "Dropout" in insight.type:
                response["dropout_risk"] = val
            elif "Placement" in insight.type:
                response["placement_probability"] = val
            elif "Financial" in insight.type:
                response["financial_risk"] = val
            elif "Burnout" in insight.type:
                response["burnout_risk"] = val
            elif "Scholarship" in insight.type:
                response["scholarship_probability"] = val

        return response

    async def run_predictions_and_save(self, db: AsyncSession, student_profile_id: str) -> List[PredictiveInsight]:
        """Run predictive intelligence mathematical risk models and persist insights to PostgreSQL."""
        # Fetch success index
        result = await db.execute(
            select(SuccessIndex).where(SuccessIndex.student_id == student_profile_id)
        )
        idx = result.scalar_one_or_none()

        # Defaults if no success index yet
        academic = idx.academic_score if idx else 80.0
        career = idx.career_score if idx else 70.0
        engagement = idx.engagement_score if idx else 75.0
        financial = idx.financial_score if idx else 85.0
        wellness = idx.wellness_score if idx else 75.0

        # Calculate Placement Probability: weighted based on CGPA and Career Score
        placement_conf = min(0.99, max(0.40, (academic * 0.40 + career * 0.50 + engagement * 0.10) / 100.0))
        
        # Calculate Dropout Risk: inversely proportional to Academic and Engagement
        dropout_conf = min(0.90, max(0.05, (100.0 - (academic * 0.50 + engagement * 0.50)) / 100.0))
        
        # Calculate Burnout Risk: high if engagement is high but wellness is low
        burnout_conf = min(0.90, max(0.05, (engagement * 0.60 + (100.0 - wellness) * 0.40) / 100.0))
        
        # Calculate Financial Risk: inversely proportional to financial score
        financial_conf = min(0.90, max(0.05, (100.0 - financial) / 100.0))
        
        # Calculate Scholarship Probability: highly correlated with CGPA/Academic Score
        scholarship_conf = min(0.99, max(0.20, (academic * 0.80 + financial_conf * 100 * 0.20) / 100.0))

        predictions = [
            {
                "type": "Placement Probability",
                "risk_level": "LOW" if placement_conf >= 0.75 else "MEDIUM" if placement_conf >= 0.50 else "HIGH",
                "prediction": f"Placement probability calculated at {int(placement_conf*100)}% based on career progress.",
                "confidence": placement_conf,
                "recommended_action": "Secure a professional internship to push probability above 90%.",
                "explanation": "High academic and career scores signal solid capability to recruiters."
            },
            {
                "type": "Dropout Risk",
                "risk_level": "LOW" if dropout_conf < 0.25 else "MEDIUM" if dropout_conf < 0.50 else "HIGH",
                "prediction": f"Dropout risk is low at {int(dropout_conf*100)}%. Keep up the academic drive.",
                "confidence": dropout_conf,
                "recommended_action": "Maintain high study session engagement and class attendance.",
                "explanation": "Consistent academic performance minimizes dropout likelihood."
            },
            {
                "type": "Burnout Risk",
                "risk_level": "LOW" if burnout_conf < 0.30 else "MEDIUM" if burnout_conf < 0.60 else "HIGH",
                "prediction": f"Burnout risk estimated at {int(burnout_conf*100)}% based on high engagement.",
                "confidence": burnout_conf,
                "recommended_action": "Dedicate time for physical activities and mindfulness this week.",
                "explanation": "High dedication to course modules can lead to stress without adequate rest."
            },
            {
                "type": "Financial Risk",
                "risk_level": "LOW" if financial_conf < 0.25 else "MEDIUM" if financial_conf < 0.50 else "HIGH",
                "prediction": f"Financial constraints risk is at {int(financial_conf*100)}%.",
                "confidence": financial_conf,
                "recommended_action": "Apply for the newly recommended state merit scholarship.",
                "explanation": "Current profile indicates potential eligibility for tuition fee waivers."
            },
            {
                "type": "Scholarship Probability",
                "risk_level": "LOW" if scholarship_conf >= 0.75 else "MEDIUM" if scholarship_conf >= 0.50 else "HIGH",
                "prediction": f"Probability of securing a scholarship is {int(scholarship_conf*100)}%.",
                "confidence": scholarship_conf,
                "recommended_action": "Maintain a CGPA above 8.5 to qualify for top-tier schemes.",
                "explanation": "Academic excellence is the primary filtering criteria for corporate and government grants."
            }
        ]

        # Delete existing insights to prevent bloating
        existing = await db.execute(
            select(PredictiveInsight).where(PredictiveInsight.student_id == student_profile_id)
        )
        for old in existing.scalars().all():
            await db.delete(old)

        saved_insights = []
        for p in predictions:
            insight = PredictiveInsight(
                id=str(uuid.uuid4()),
                student_id=student_profile_id,
                type=p["type"],
                risk_level=p["risk_level"],
                prediction=p["prediction"],
                confidence=p["confidence"],
                recommended_action=p["recommended_action"],
                explanation=p["explanation"]
            )
            db.add(insight)
            saved_insights.append(insight)

        await db.commit()
        logger.info(f"[Predictions] Generated and saved 5 predictive insights for student: {student_profile_id}")
        return saved_insights

predictive_intelligence_service = PredictiveIntelligenceService()
