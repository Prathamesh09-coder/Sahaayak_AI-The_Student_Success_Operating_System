from app.services.knowledge_graph_service import knowledge_graph_service

class SkillGapService:
    async def analyze_gap(self, student_id: str, career_id: str, student_existing_skills: list[str]) -> dict:
        """
        Analyzes the gap between what a student knows and what a career requires.
        """
        required_skills = await knowledge_graph_service.query_career_requirements(career_id)
        
        # If KG is empty/mocking
        if not required_skills:
            required_skills = ["Python", "SQL", "Machine Learning", "Deep Learning", "MLOps", "Git"]

        existing_set = set(student_existing_skills)
        required_set = set(required_skills)
        
        missing_skills = list(required_set - existing_set)
        
        completion = 0
        if required_set:
            completion = int((len(existing_set.intersection(required_set)) / len(required_set)) * 100)

        return {
            "existing_skills": list(existing_set),
            "missing_skills": missing_skills,
            "completion": completion
        }

skill_gap_service = SkillGapService()
