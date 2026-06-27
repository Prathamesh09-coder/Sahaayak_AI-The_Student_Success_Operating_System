from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.repositories import profile_repository, digital_twin_repository
from app.schemas.dashboard import DashboardOverviewResponse
from app.models.student_activity import StudentActivity
from app.services.recommendation_service import recommendation_service
from app.core.redis import redis_client
from datetime import datetime, timezone
import uuid
import json

async def get_dashboard_overview(db: AsyncSession, student_id: str) -> DashboardOverviewResponse:
    cache_key = f"dashboard:{student_id}"
    try:
        cached_data = await redis_client.get(cache_key)
        if cached_data:
            data = json.loads(cached_data)
            return DashboardOverviewResponse(**data)
    except Exception:
        pass

    student = await profile_repository.get_student_profile_by_id(db, student_id)
    twin = await digital_twin_repository.get_digital_twin(db, student_id)
    goals = await profile_repository.get_student_goals(db, student_id)
    
    completeness = student.profile_completeness if student else 0.0
    
    success_index = twin.success_score if twin else 0.0
    risk_score = twin.risk_score if twin else 0.0
    academic_score = twin.academic_score if twin else 0.0
    financial_stability = twin.financial_stability if twin else 0.0
    career_readiness = twin.career_readiness if twin else 0.0
    confidence_score = twin.confidence_score if twin else 0.0
    
    # Calculate Goals Progress
    completed_goals = sum(1 for g in goals if g.status == "COMPLETED")
    pending_goals = sum(1 for g in goals if g.status != "COMPLETED")
    total_goals = len(goals)
    progress_percentage = (completed_goals / total_goals * 100) if total_goals > 0 else 0.0
    
    recs = []
    if twin:
        recs = recommendation_service.generate_recommendations(twin)
        
    if completeness < 100:
        recs.append(f"Your profile is only {completeness}% complete. Finish onboarding to unlock personalized matches.")

    # Recent activities
    activities_result = await db.execute(
        select(StudentActivity).where(StudentActivity.student_id == student_id).order_by(StudentActivity.created_at.desc()).limit(10)
    )
    activities = activities_result.scalars().all()
    
    recent_activities = []
    for act in activities:
        recent_activities.append({
            "title": act.activity_type,
            "description": act.activity_description,
            "timestamp": act.created_at
        })

    digital_twin_summary = {
        "academic_score": academic_score,
        "financial_stability": financial_stability,
        "career_readiness": career_readiness,
        "confidence_score": confidence_score
    }
    
    student_name = student.user.email.split('@')[0] if student and student.user else "Student"

    response = DashboardOverviewResponse(
        student_name=student_name,
        success_index=success_index,
        profile_completeness=completeness,
        risk_score=risk_score,
        confidence_score=confidence_score,
        upcoming_deadlines=[], # Future
        recommendations=recs,
        goals_progress={
            "completed": completed_goals,
            "pending": pending_goals,
            "progress_percentage": round(progress_percentage, 1)
        },
        scholarships=[], # Future DB query
        opportunities=[], # Future DB query
        mentor_suggestions=[], # Future DB query
        recent_activities=recent_activities,
        digital_twin_summary=digital_twin_summary,
        notifications_count=0,
        last_updated=datetime.now(timezone.utc)
    )

    try:
        # Cache for 5 minutes (300 seconds)
        await redis_client.setex(cache_key, 300, response.model_dump_json())
    except Exception:
        pass

    return response
