from app.services.skill_gap_service import skill_gap_service
from app.services.knowledge_graph_service import knowledge_graph_service
import uuid

class RoadmapGenerationService:
    async def generate_roadmap(self, student_id: str, career_id: str, student_existing_skills: list[str]) -> dict:
        """
        1. Query KG / Skill Gap
        2. Generate Milestones
        3. Generate Steps
        4. Recommend resources
        """
        gap_analysis = await skill_gap_service.analyze_gap(student_id, career_id, student_existing_skills)
        missing_skills = gap_analysis["missing_skills"]

        recommendations = [{"title": f"Complete the '{skill}' track", "type": "certification"} for skill in missing_skills]

        # Mocking the generation logic
        roadmap_id = str(uuid.uuid4())
        
        milestones = []
        steps = []
        
        # Split missing skills into mock months
        month = 1
        for skill in missing_skills:
            milestones.append({
                "id": str(uuid.uuid4()),
                "title": f"Master {skill}",
                "description": f"Learn the fundamentals of {skill} and complete a small project.",
                "reward_points": 500
            })
            
            steps.append({
                "id": str(uuid.uuid4()),
                "title": f"Learn {skill}",
                "description": f"Complete online courses and practical labs for {skill}.",
                "step_order": month,
                "skill_name": skill,
                "estimated_hours": 20,
                "resource_type": "course"
            })
            month += 1

        return {
            "roadmap_id": roadmap_id,
            "title": "Machine Learning Engineer Roadmap",
            "gap_analysis": gap_analysis,
            "milestones": milestones,
            "steps": steps,
            "recommendations": recommendations
        }

roadmap_generation_service = RoadmapGenerationService()
