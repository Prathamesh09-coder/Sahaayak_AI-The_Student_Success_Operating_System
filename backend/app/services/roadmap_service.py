from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from app.repositories import roadmap_repository, milestone_repository, profile_repository, career_repository
from app.models.student_profile import StudentProfile
from app.models.roadmap import Roadmap
from app.models.roadmap_step import RoadmapStep
from app.models.milestone import Milestone
from app.services.roadmap_generation_service import roadmap_generation_service
from app.realtime.websocket_manager import manager, EventType
import logging
import uuid
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

async def resolve_student(db: AsyncSession, student_id: str) -> Optional[StudentProfile]:
    """Resolve student profile by either its own ID or User's ID."""
    profile = await profile_repository.get_student_profile_by_id(db, student_id)
    if not profile:
        profile = await profile_repository.get_student_profile(db, student_id)
    return profile

class RoadmapService:
    async def get_active_roadmap(self, db: AsyncSession, student_id: str) -> Optional[Roadmap]:
        """Fetch the active roadmap for a student."""
        profile = await resolve_student(db, student_id)
        if not profile:
            return None
        return await roadmap_repository.get_student_roadmap(db, profile.user_id)

    async def generate_and_save_roadmap(self, db: AsyncSession, student_id: str, career_id: Optional[str] = None) -> Optional[Roadmap]:
        """Generate a personalized AI roadmap and save it to the PostgreSQL database."""
        profile = await resolve_student(db, student_id)
        if not profile:
            logger.error(f"Student profile not found for ID: {student_id}")
            return None

        # Fetch Career Profile for dream career and existing skills
        career_profile = await profile_repository.get_career_profile(db, profile.id)
        existing_skills = career_profile.skills if (career_profile and career_profile.skills) else []
        dream_career = career_profile.dream_career if (career_profile and career_profile.dream_career) else "Software Engineer"

        # If career_id is not provided, look up or create a CareerPath matching the dream career
        career_path = None
        if career_id:
            career_path = await career_repository.get_career_path(db, career_id)
        
        if not career_path:
            career_path = await career_repository.get_career_path_by_name(db, dream_career)
            if not career_path:
                career_path = await career_repository.create_career_path(
                    db,
                    name=dream_career,
                    description=f"AI generated career path for {dream_career}",
                    average_salary=12.0, # ₹12 LPA default
                    growth_rate=15.0, # 15% growth default
                    difficulty_level="Intermediate"
                )

        # Call AI roadmap generator service
        generated = await roadmap_generation_service.generate_roadmap(
            profile.id, career_path.id, existing_skills
        )

        # Save Roadmap to PostgreSQL
        title = f"{dream_career} Success Roadmap"
        roadmap = await roadmap_repository.create_roadmap(db, profile.user_id, title, career_path.id)

        # Save Roadmap Steps
        steps_data = generated.get("steps", [])
        for idx, step_item in enumerate(steps_data):
            # Formulate mock resource links
            resource_links = [
                {
                    "title": f"{step_item.get('skill_name', 'Skill')} Course",
                    "provider": "Coursera",
                    "url": "https://coursera.org"
                },
                {
                    "title": f"Hands-on {step_item.get('skill_name', 'Skill')} Project",
                    "provider": "Sahaayak AI Labs",
                    "url": "https://github.com"
                }
            ]
            await roadmap_repository.create_roadmap_step(
                db,
                roadmap_id=roadmap.id,
                title=step_item.get("title", "Learn Skill"),
                description=step_item.get("description", "Master this step"),
                step_order=idx + 1,
                difficulty="Intermediate",
                estimated_hours=float(step_item.get("estimated_hours", 20)),
                resource_type=step_item.get("resource_type", "course"),
                resource_links=resource_links,
                is_mandatory=True
            )

        # Save Milestones
        milestones_data = generated.get("milestones", [])
        # Also append some premium milestones if none generated
        if not milestones_data:
            milestones_data = [
                {"title": "🏆 First Project", "reward_points": 500, "description": "Complete your first practical project."},
                {"title": "🏆 50% Roadmap Complete", "reward_points": 1000, "description": "Achieve 50% milestone on your route."},
                {"title": "🏆 First Internship", "reward_points": 1500, "description": "Apply and secure your first internship."}
            ]

        for idx, ms_item in enumerate(milestones_data):
            target_date = datetime.utcnow() + timedelta(days=(idx + 1) * 30)
            await milestone_repository.create_milestone(
                db,
                roadmap_id=roadmap.id,
                title=ms_item.get("title", "Milestone"),
                description=ms_item.get("description", "Goal achievement"),
                target_date=target_date,
                reward_points=ms_item.get("reward_points", 500)
            )

        # Eager load steps and milestones to return
        fresh_roadmap = await roadmap_repository.get_roadmap_by_id(db, roadmap.id)
        
        # Broadcast real-time update event via WebSockets
        await manager.emit_event(
            EventType.ROADMAP_UPDATED,
            {"roadmap_id": fresh_roadmap.id, "title": fresh_roadmap.title},
            user_id=profile.user_id
        )

        return fresh_roadmap

    async def toggle_step_completion(self, db: AsyncSession, step_id: str, student_id: str) -> Optional[RoadmapStep]:
        """Toggle step status between pending and completed, recalculate progress, and trigger milestone unlocks."""
        profile = await resolve_student(db, student_id)
        if not profile:
            logger.error(f"Student profile not found for step update: {student_id}")
            return None

        step = await roadmap_repository.get_step(db, step_id)
        if not step:
            logger.error(f"Step not found: {step_id}")
            return None

        # Toggle status
        new_status = "completed" if step.status != "completed" else "pending"
        updated_step = await roadmap_repository.update_step_status(db, step_id, new_status)

        # Retrieve the updated roadmap
        roadmap = await roadmap_repository.get_roadmap_by_id(db, step.roadmap_id)
        if roadmap:
            # Check milestone unlocks based on completion percentage
            milestones = await milestone_repository.get_roadmap_milestones(db, roadmap.id)
            
            # Auto-complete certain milestones based on percentage
            percent = roadmap.completion_percentage
            
            for ms in milestones:
                if "50%" in ms.title and percent >= 50.0 and not ms.completed:
                    await milestone_repository.update_milestone_status(db, ms.id, True)
                    await manager.emit_event(
                        EventType.MILESTONE_COMPLETED,
                        {"milestone_id": ms.id, "title": ms.title},
                        user_id=profile.user_id
                    )
                elif "First Project" in ms.title and percent > 0.0 and not ms.completed:
                    await milestone_repository.update_milestone_status(db, ms.id, True)
                    await manager.emit_event(
                        EventType.MILESTONE_COMPLETED,
                        {"milestone_id": ms.id, "title": ms.title},
                        user_id=profile.user_id
                    )
                elif "Internship" in ms.title and percent >= 90.0 and not ms.completed:
                    await milestone_repository.update_milestone_status(db, ms.id, True)
                    await manager.emit_event(
                        EventType.MILESTONE_COMPLETED,
                        {"milestone_id": ms.id, "title": ms.title},
                        user_id=profile.user_id
                    )

            # Broadcast WebSocket events to trigger TanStack Query cache invalidations
            await manager.emit_event(
                EventType.STEP_COMPLETED,
                {"step_id": step_id, "status": new_status, "completion_percentage": percent},
                user_id=profile.user_id
            )
            await manager.emit_event(
                EventType.ROADMAP_UPDATED,
                {"roadmap_id": roadmap.id, "completion_percentage": percent},
                user_id=profile.user_id
            )

            # Trigger real-time Success Index and risk metrics re-computation
            try:
                from app.services.success_index_service import success_index_service
                await success_index_service.recalculate_student_success_metrics(db, profile.id)
            except Exception as re_err:
                logger.error(f"Failed to trigger success metrics re-computation: {re_err}", exc_info=True)

        return updated_step

roadmap_service = RoadmapService()
