from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Any, Optional
from app.models.intervention import Intervention, InterventionCategory
from app.models.success_index import SuccessIndex
from app.services.roadmap_service import resolve_student
import uuid
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class InterventionService:
    async def get_student_interventions(self, db: AsyncSession, student_id: str) -> List[Dict[str, Any]]:
        """Retrieve active intervention alerts for the student from the database. Auto-generate if empty."""
        profile = await resolve_student(db, student_id)
        if not profile:
            return []

        result = await db.execute(
            select(Intervention)
            .where(Intervention.student_id == profile.id, Intervention.status == "PENDING")
            .order_by(Intervention.created_at.desc())
        )
        interventions = result.scalars().all()

        if not interventions:
            # Run scan and save first
            await self.scan_and_create_interventions(db, profile.id)
            # Re-fetch
            result = await db.execute(
                select(Intervention)
                .where(Intervention.student_id == profile.id, Intervention.status == "PENDING")
                .order_by(Intervention.created_at.desc())
            )
            interventions = result.scalars().all()

        # Format to match API contract
        response = []
        for item in interventions:
            response.append({
                "id": item.id,
                "type": item.type.value if item.type else "GENERAL",
                "severity": item.severity,
                "reason": item.reason,
                "recommended_action": item.recommended_action,
                "status": item.status,
                "risk_score": item.risk_score
            })
        return response

    async def scan_and_create_interventions(self, db: AsyncSession, student_profile_id: str) -> List[Intervention]:
        """Scan student success index scores and profile fields. Flag threshold violations as active database interventions."""
        # Retrieve success index
        result = await db.execute(
            select(SuccessIndex).where(SuccessIndex.student_id == student_profile_id)
        )
        idx = result.scalar_one_or_none()

        alerts_to_create = []

        # 1. Academic Warning: CGPA < 8.0
        if idx and idx.academic_score < 80.0:
            alerts_to_create.append({
                "type": InterventionCategory.ACADEMIC,
                "severity": "HIGH",
                "reason": f"Academic standing alert: Your current CGPA equivalent is {idx.academic_score/10.0}, which falls below the placement threshold.",
                "recommended_action": "Enroll in the AI Mentor's peer study groups immediately.",
                "risk_score": float(100.0 - idx.academic_score),
                "trigger": "LOW_CGPA"
            })

        # 2. Career Warning: Career Score < 70.0
        if idx and idx.career_score < 70.0:
            alerts_to_create.append({
                "type": InterventionCategory.CAREER,
                "severity": "HIGH",
                "reason": "Placement preparedness alert: You have no active summer internship applications logged.",
                "recommended_action": "Navigate to the Opportunities section and apply for at least 2 matching roles.",
                "risk_score": float(100.0 - idx.career_score),
                "trigger": "NO_INTERNSHIP_APPLIED"
            })

        # 3. Financial/Scholarship Warning: default deadline alert if none else
        alerts_to_create.append({
            "type": InterventionCategory.FINANCIAL,
            "severity": "HIGH",
            "reason": "Scholarship Alert: AICTE Pragati Merit Scholarship application deadline is in 2 days.",
            "recommended_action": "Complete your profile edit page and click Apply under the Scholarships tab.",
            "risk_score": 75.0,
            "trigger": "SCHOLARSHIP_DEADLINE"
        })

        # 4. Wellness Warning: wellness score < 60
        if idx and idx.wellness_score < 60.0:
            alerts_to_create.append({
                "type": InterventionCategory.MENTAL_WELLNESS,
                "severity": "MEDIUM",
                "reason": "High burnout risk detected based on continuous platform logging hours without rest.",
                "recommended_action": "Schedule a brief, rejuvenating conversation with the AI Mentor.",
                "risk_score": float(100.0 - idx.wellness_score),
                "trigger": "BURNOUT_RISK"
            })

        # Delete existing pending interventions to prevent duplicates
        existing = await db.execute(
            select(Intervention).where(Intervention.student_id == student_profile_id, Intervention.status == "PENDING")
        )
        for old in existing.scalars().all():
            await db.delete(old)

        saved_interventions = []
        for alert in alerts_to_create:
            intervention = Intervention(
                id=str(uuid.uuid4()),
                student_id=student_profile_id,
                type=alert["type"],
                severity=alert["severity"],
                reason=alert["reason"],
                recommended_action=alert["recommended_action"],
                status="PENDING",
                risk_score=alert["risk_score"],
                trigger_source=alert["trigger"],
                is_auto_generated=True
            )
            db.add(intervention)
            saved_interventions.append(intervention)

        await db.commit()
        logger.info(f"[Interventions] Scanned student {student_profile_id} and created {len(saved_interventions)} active interventions.")
        return saved_interventions

    async def resolve_intervention(self, db: AsyncSession, intervention_id: str, resolved_by: str) -> Optional[Intervention]:
        """Mark an active intervention as resolved."""
        result = await db.execute(select(Intervention).where(Intervention.id == intervention_id))
        intervention = result.scalar_one_or_none()
        if intervention:
            intervention.status = "RESOLVED"
            intervention.resolved_at = datetime.utcnow()
            intervention.resolved_by = resolved_by
            db.add(intervention)
            await db.commit()
            await db.refresh(intervention)
        return intervention

destruction_service = InterventionService() # Keep name variable in case imported elsewhere as destruction_service, or use intervention_service
intervention_service = destruction_service
