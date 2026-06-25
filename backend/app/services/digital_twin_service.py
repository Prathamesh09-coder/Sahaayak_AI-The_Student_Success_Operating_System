from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories import profile_repository, digital_twin_repository
from app.models.digital_twin import DigitalTwin
from app.models.digital_twin_history import DigitalTwinHistory
import logging

logger = logging.getLogger(__name__)

async def generate_digital_twin(db: AsyncSession, student_id: str) -> DigitalTwin:
    """Generate or update a Digital Twin for the given StudentProfile.id."""
    # student_id here is StudentProfile.id (PK), NOT user_id
    student = await profile_repository.get_student_profile_by_id(db, student_id)
    family = await profile_repository.get_family_profile(db, student_id)
    career = await profile_repository.get_career_profile(db, student_id)
    goals = await profile_repository.get_student_goals(db, student_id)
    assessment = await profile_repository.get_assessment_profile(db, student_id)
    
    if not student:
        raise ValueError("Student profile missing")

    # Academic Score
    academic_score = 0.0
    if student.cgpa:
        academic_score = min((student.cgpa / 10) * 100, 100)
        
    # Financial Stability
    financial_stability = 0.0
    if family and family.annual_income is not None:
        if family.annual_income < 200000:
            financial_stability = 30
        elif family.annual_income < 500000:
            financial_stability = 50
        elif family.annual_income < 1000000:
            financial_stability = 75
        else:
            financial_stability = 90

    # Career Readiness
    career_readiness = 0.0
    if career:
        skills_score = min(len(career.skills or []) * 5, 40)
        goals_score = min(len(goals or []) * 10, 40)
        dream_score = 20 if career.dream_career else 0
        career_readiness = skills_score + goals_score + dream_score

    # Confidence Score
    confidence_score = 50.0
    if assessment:
        conf_val = (assessment.confidence_level + assessment.motivation_level + assessment.communication_skill) / 3
        confidence_score = (conf_val / 10) * 100

    # Engagement Score
    engagement_score = 50.0

    # Risk Score
    risk_score = max(0, 100 - (academic_score * 0.4 + confidence_score * 0.3 + career_readiness * 0.3))

    # Success Score
    success_score = (
        academic_score * 0.30 +
        career_readiness * 0.25 +
        confidence_score * 0.20 +
        financial_stability * 0.10 +
        engagement_score * 0.15
    )

    # AI Insights — dynamic, context-aware
    ai_insights = []

    # Academic insights
    if academic_score >= 85:
        ai_insights.append("🎓 Outstanding academic performance — you qualify for merit-based scholarships. Check the Scholarships tab.")
    elif academic_score >= 60:
        ai_insights.append("📚 Solid academic standing. Focus on consistency and competitive exams to move into the top tier.")
    elif academic_score > 0:
        ai_insights.append("📖 Your academic score has room for growth. Consider joining a peer study group through Community.")
    else:
        ai_insights.append("📝 Update your CGPA in Settings to unlock academic-based recommendations.")

    # Financial insights
    if financial_stability <= 30:
        ai_insights.append("💰 You may qualify for need-based government schemes. Explore the Govt. Schemes section.")
    elif financial_stability <= 50:
        ai_insights.append("🏦 Financial assistance is available. Your Digital Twin has matched you with relevant scholarships.")

    # Career readiness insights
    if career_readiness >= 70:
        ai_insights.append("🚀 Your career readiness is strong. You're well-positioned for internship applications.")
    elif career_readiness >= 40:
        ai_insights.append("🗺️ Good foundation! Add 2-3 more skills in Career GPS to unlock higher match scores with opportunities.")
    elif career and career.dream_career:
        ai_insights.append(f"🎯 You're aiming for {career.dream_career} — complete your skill profile to get a personalized roadmap.")
    else:
        ai_insights.append("🧭 Set a dream career in your profile to unlock Career GPS recommendations.")

    # Confidence insights
    if confidence_score < 50:
        ai_insights.append("💬 Your confidence metrics suggest mentor support would help. Book a session in the Mentor Network.")
    elif confidence_score >= 80:
        ai_insights.append("⭐ High confidence detected! Consider becoming a peer mentor to help others.")

    # Goals insights
    goals_count = len(goals) if goals else 0
    if goals_count == 0:
        ai_insights.append("🎯 No goals set yet. Add at least one short-term goal to activate your Success Navigator.")
    elif goals_count >= 3:
        ai_insights.append(f"✅ You have {goals_count} active goals — stay consistent and track weekly progress.")

    # Skills insights
    skills_count = len(career.skills) if career and career.skills else 0
    if skills_count == 0:
        ai_insights.append("🔧 Add your existing skills to get matched with relevant opportunities and courses.")
    elif skills_count < 3:
        ai_insights.append(f"🛠️ You have {skills_count} skill(s) listed. Adding more will improve your opportunity match rate.")

    # First-gen learner insights
    if family and getattr(family, 'first_generation_learner', False):
        ai_insights.append("🌟 As a first-generation learner, you have access to exclusive mentorship and scholarship programs.")

    # Risk insight
    if risk_score > 60:
        ai_insights.append("⚠️ Your risk score is elevated. Focus on academic consistency and seek mentorship to stay on track.")

    twin = await digital_twin_repository.get_digital_twin(db, student_id)
    if not twin:
        twin = DigitalTwin(student_id=student_id)
        
    twin.academic_score = round(academic_score, 1)
    twin.career_readiness = round(career_readiness, 1)
    twin.financial_stability = round(financial_stability, 1)
    twin.confidence_score = round(confidence_score, 1)
    twin.engagement_score = round(engagement_score, 1)
    twin.risk_score = round(risk_score, 1)
    twin.success_score = round(success_score, 1)
    twin.ai_insights = ai_insights

    twin = await digital_twin_repository.save_digital_twin(db, twin)

    # Store Snapshot History
    history = DigitalTwinHistory(
        student_id=student_id,
        academic_score=twin.academic_score,
        career_readiness=twin.career_readiness,
        financial_stability=twin.financial_stability,
        confidence_score=twin.confidence_score,
        engagement_score=twin.engagement_score,
        risk_score=twin.risk_score,
        success_score=twin.success_score,
        version=1, # simplified versioning
        trigger_source="recalculation"
    )
    await digital_twin_repository.save_twin_history(db, history)
    
    student.last_twin_generated_at = twin.last_updated
    await profile_repository.save_profile(db, student)
    
    # Fire WebSocket event
    try:
        from app.realtime.websocket_manager import manager
        await manager.broadcast({"type": "twin.updated", "student_id": student_id, "message": "Digital Twin was recalculated."})
    except Exception as e:
        print("WS broadcast failed", e)
    
    return twin
