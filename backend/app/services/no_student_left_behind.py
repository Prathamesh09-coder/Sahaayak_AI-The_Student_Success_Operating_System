from app.services.intervention_service import intervention_service
from app.models.intervention import InterventionCategory
import logging

logger = logging.getLogger(__name__)

class NoStudentLeftBehindEngine:
    async def run_daily_checks(self):
        """
        Runs daily to check for missed opportunities, inactive students, etc.
        Triggers interventions and notifications.
        """
        logger.info("Running No Student Left Behind Engine...")
        
        # Mock logic
        students_to_check = [{"id": "student_1", "last_login_days": 15, "missed_scholarships": 2}]
        
        for student in students_to_check:
            if student["last_login_days"] > 14:
                await intervention_service.create_intervention(
                    student_id=student["id"],
                    category=InterventionCategory.ENGAGEMENT,
                    severity="HIGH",
                    reason="Student has not logged in for over 14 days.",
                    recommended_action="Send automated check-in email.",
                    risk_score=85.0,
                    trigger_source="INACTIVE_STUDENT"
                )
                
            if student["missed_scholarships"] > 0:
                 await intervention_service.create_intervention(
                    student_id=student["id"],
                    category=InterventionCategory.FINANCIAL,
                    severity="HIGH",
                    reason=f"Student missed {student['missed_scholarships']} scholarships.",
                    recommended_action="Schedule mentor session for scholarship applications.",
                    risk_score=90.0,
                    trigger_source="MISSED_SCHOLARSHIP"
                )

no_student_left_behind_engine = NoStudentLeftBehindEngine()
