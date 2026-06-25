from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List, Dict, Any
from app.repositories import profile_repository, roadmap_repository, milestone_repository, career_repository
from app.models.student_profile import StudentProfile
from app.services.roadmap_service import resolve_student
from app.services.skill_gap_service import skill_gap_service
from app.services.knowledge_graph_service import knowledge_graph_service

class CareerGPSService:
    async def get_career_summary(self, db: AsyncSession, student_id: str) -> Dict[str, Any]:
        """Compile a premium career summary card payload."""
        profile = await resolve_student(db, student_id)
        if not profile:
            return {
                "dream_career": "Software Engineer",
                "career_match_score": 0,
                "estimated_time_months": 8,
                "industry_growth": "High",
                "average_salary": "₹12 LPA",
                "roadmap_completion": 0
            }

        # Fetch Career Profile
        career_profile = await profile_repository.get_career_profile(db, profile.id)
        dream_career = career_profile.dream_career if (career_profile and career_profile.dream_career) else "Software Engineer"
        existing_skills = career_profile.skills if (career_profile and career_profile.skills) else []

        # Find CareerPath
        career_path = await career_repository.get_career_path_by_name(db, dream_career)
        average_salary = "₹12 LPA"
        growth_rate = "High"
        if career_path:
            if career_path.average_salary:
                average_salary = f"₹{int(career_path.average_salary)} LPA"
            if career_path.growth_rate:
                growth_rate = f"{int(career_path.growth_rate)}% Growth" if career_path.growth_rate > 3.0 else "Stable"

        # Analyze skill gap to get completion/readiness score
        gap = await skill_gap_service.analyze_gap(profile.id, career_path.id if career_path else "default", existing_skills)
        match_score = gap.get("completion", 50)

        # Get active roadmap completion
        roadmap = await roadmap_repository.get_student_roadmap(db, profile.user_id)
        roadmap_completion = int(roadmap.completion_percentage) if roadmap else 0

        # Calculate estimated time based on roadmap steps
        estimated_time = 8
        if roadmap and roadmap.steps:
            estimated_time = max(len(roadmap.steps), 4)

        return {
            "dream_career": dream_career,
            "career_match_score": match_score,
            "estimated_time_months": estimated_time,
            "industry_growth": growth_rate,
            "average_salary": average_salary,
            "roadmap_completion": roadmap_completion
        }

    async def get_skill_gaps(self, db: AsyncSession, student_id: str, career_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Compute structured skill gaps including priorities and levels."""
        profile = await resolve_student(db, student_id)
        if not profile:
            return []

        # Fetch Career Profile
        career_profile = await profile_repository.get_career_profile(db, profile.id)
        dream_career = career_profile.dream_career if (career_profile and career_profile.dream_career) else "Software Engineer"
        existing_skills = set(career_profile.skills if (career_profile and career_profile.skills) else [])

        # Fetch career path requirements
        career_path = None
        if career_id:
            career_path = await career_repository.get_career_path(db, career_id)
        if not career_path:
            career_path = await career_repository.get_career_path_by_name(db, dream_career)

        required_skills = []
        if career_path:
            required_skills = await knowledge_graph_service.query_career_requirements(career_path.id)
        
        if not required_skills:
            # Fallback standard list
            required_skills = ["Python", "Machine Learning", "SQL", "Deep Learning", "Git", "MLOps"]

        gaps = []
        for skill in required_skills:
            has_skill = skill in existing_skills
            
            current_level = 8 if has_skill else 3
            required_level = 9 if skill in ["Machine Learning", "Deep Learning"] else 8
            gap_val = required_level - current_level
            
            # Determine priority
            if gap_val >= 5:
                priority = "CRITICAL"
            elif gap_val >= 3:
                priority = "HIGH"
            elif gap_val >= 1:
                priority = "MEDIUM"
            else:
                priority = "LOW"

            gaps.append({
                "skill": skill,
                "current_level": current_level,
                "required_level": required_level,
                "gap": gap_val,
                "priority": priority
            })

        # Sort by gap descending (largest gap first) so critical items appear first
        gaps.sort(key=lambda x: x["gap"], reverse=True)
        return gaps

    async def get_recommendations(self, db: AsyncSession, student_id: str) -> List[Dict[str, Any]]:
        """Generate course and project recommendations based on skill gaps."""
        gaps = await self.get_skill_gaps(db, student_id)
        missing_skills = [g["skill"] for g in gaps if g["gap"] > 0]

        recommendations = []
        for skill in missing_skills:
            if skill == "Python":
                recommendations.append({
                    "type": "COURSE",
                    "title": "Python for Data Science and AI (Coursera)",
                    "reason": "You need to master Python fundamentals and data operations."
                })
            elif skill == "Machine Learning":
                recommendations.append({
                    "type": "COURSE",
                    "title": "Machine Learning Specialization by Andrew Ng",
                    "reason": "You lack ML fundamentals and core math concepts."
                })
            elif skill == "SQL":
                recommendations.append({
                    "type": "COURSE",
                    "title": "Complete SQL Bootcamp (Udemy)",
                    "reason": "Required for database operations and feature engineering."
                })
            elif skill == "Deep Learning":
                recommendations.append({
                    "type": "PROJECT",
                    "title": "Build a Neural Network from Scratch",
                    "reason": "Deepen your understanding of backpropagation and deep layers."
                })
            elif skill == "Git":
                recommendations.append({
                    "type": "COURSE",
                    "title": "Version Control with Git",
                    "reason": "Essential for team collaborations and professional workflows."
                })
            else:
                recommendations.append({
                    "type": "COURSE",
                    "title": f"Mastering {skill} (Advanced Guide)",
                    "reason": f"Acquire necessary skills to bridge your {skill} gap."
                })

        # Fallback if no gaps
        if not recommendations:
            recommendations.append({
                "type": "COURSE",
                "title": "System Design Fundamentals",
                "reason": "You have solid skills, now prepare for scale and architecture."
            })

        return recommendations[:5] # Limit to top 5

    async def get_milestones(self, db: AsyncSession, student_id: str) -> List[Dict[str, Any]]:
        """Fetch gamified milestone achievements for the student."""
        profile = await resolve_student(db, student_id)
        if not profile:
            return []

        roadmap = await roadmap_repository.get_student_roadmap(db, profile.user_id)
        if not roadmap:
            return []

        milestones = await milestone_repository.get_roadmap_milestones(db, roadmap.id)
        
        result = []
        for ms in milestones:
            result.append({
                "id": ms.id,
                "title": ms.title,
                "description": ms.description,
                "completed": ms.completed,
                "completed_at": datetime.utcnow().strftime("%Y-%m-%d") if ms.completed else None,
                "reward_points": ms.reward_points
            })
        return result

    async def get_progress_metrics(self, db: AsyncSession, student_id: str) -> Dict[str, Any]:
        """Fetch overall completion and reward metrics."""
        profile = await resolve_student(db, student_id)
        if not profile:
            return {"roadmap_completion": 0, "completed_steps": 0, "total_steps": 0, "reward_points": 0}

        roadmap = await roadmap_repository.get_student_roadmap(db, profile.user_id)
        if not roadmap:
            return {"roadmap_completion": 0, "completed_steps": 0, "total_steps": 0, "reward_points": 0}

        steps = roadmap.steps if roadmap.steps else []
        completed_steps = [s for s in steps if s.status == "completed"]
        
        # Calculate reward points from completed milestones
        milestones = await milestone_repository.get_roadmap_milestones(db, roadmap.id)
        reward_points = sum(m.reward_points for m in milestones if m.completed)

        return {
            "roadmap_completion": int(roadmap.completion_percentage),
            "completed_steps": len(completed_steps),
            "total_steps": len(steps),
            "reward_points": reward_points
        }

    async def get_interactive_graph(self, db: AsyncSession, student_id: str) -> Dict[str, Any]:
        """Generate a beautiful multi-layered ReactFlow graph payload."""
        profile = await resolve_student(db, student_id)
        if not profile:
            return {"nodes": [], "edges": []}

        # Fetch career info
        career_profile = await profile_repository.get_career_profile(db, profile.id)
        dream_career = career_profile.dream_career if (career_profile and career_profile.dream_career) else "Software Engineer"

        gaps = await self.get_skill_gaps(db, student_id)
        
        nodes = []
        edges = []

        # Level 0: Career Node (Centered at x: 250, y: 50)
        nodes.append({
            "id": "career",
            "position": {"x": 250, "y": 50},
            "data": {"label": f"🎯 {dream_career}"},
            "style": {
                "background": "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                "color": "white",
                "borderRadius": "1rem",
                "border": "none",
                "boxShadow": "0 10px 15px -3px rgba(99, 102, 241, 0.4)",
                "padding": "10px 15px",
                "fontWeight": "bold"
            }
        })

        # Level 1: Required Skills (Spaced at y: 150)
        # Select top 3 skills to keep graph readable
        display_skills = gaps[:3]
        for idx, item in enumerate(display_skills):
            skill_name = item["skill"]
            x_pos = 100 + (idx * 150)
            node_id = f"skill-{skill_name.lower().replace(' ', '-')}"
            
            # Colored border based on priority
            border_color = "#ef4444" if item["priority"] == "CRITICAL" else "#f97316" if item["priority"] == "HIGH" else "#eab308"
            
            nodes.append({
                "id": node_id,
                "position": {"x": x_pos, "y": 150},
                "data": {"label": f"🛠️ {skill_name}"},
                "style": {
                    "background": "#1e293b",
                    "color": "white",
                    "borderRadius": "0.75rem",
                    "border": f"2px solid {border_color}",
                    "boxShadow": f"0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    "padding": "8px 12px",
                    "fontSize": "12px"
                }
            })
            
            # Connect Career -> Skill
            edges.append({
                "id": f"edge-career-{node_id}",
                "source": "career",
                "target": node_id,
                "animated": True,
                "style": {"stroke": border_color}
            })

            # Level 2: Recommended Courses (Spaced at y: 250)
            course_node_id = f"course-{node_id}"
            nodes.append({
                "id": course_node_id,
                "position": {"x": x_pos, "y": 250},
                "data": {"label": f"📖 {skill_name} Course"},
                "style": {
                    "background": "#0f766e",
                    "color": "white",
                    "borderRadius": "0.75rem",
                    "border": "none",
                    "boxShadow": "0 4px 6px -1px rgba(15, 118, 110, 0.2)",
                    "padding": "8px 12px",
                    "fontSize": "11px"
                }
            })
            
            # Connect Skill -> Course
            edges.append({
                "id": f"edge-skill-{course_node_id}",
                "source": node_id,
                "target": course_node_id,
                "animated": False
            })

            # Level 3: Hands-on Projects (Spaced at y: 350)
            project_node_id = f"project-{node_id}"
            nodes.append({
                "id": project_node_id,
                "position": {"x": x_pos, "y": 350},
                "data": {"label": f"🚀 {skill_name} Project"},
                "style": {
                    "background": "#b45309",
                    "color": "white",
                    "borderRadius": "0.75rem",
                    "border": "none",
                    "boxShadow": "0 4px 6px -1px rgba(180, 83, 9, 0.2)",
                    "padding": "8px 12px",
                    "fontSize": "11px"
                }
            })
            
            # Connect Course -> Project
            edges.append({
                "id": f"edge-course-{project_node_id}",
                "source": course_node_id,
                "target": project_node_id,
                "animated": False
            })

        # Level 4: Internships (Centered at x: 250, y: 450, connected to all projects)
        nodes.append({
            "id": "internship",
            "position": {"x": 250, "y": 450},
            "data": {"label": "🏆 Secure Summer Internship"},
            "style": {
                "background": "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
                "color": "white",
                "borderRadius": "1rem",
                "border": "none",
                "boxShadow": "0 10px 15px -3px rgba(236, 72, 153, 0.4)",
                "padding": "10px 15px",
                "fontWeight": "bold"
            }
        })

        # Connect all projects to internship
        for item in display_skills:
            skill_name = item["skill"]
            node_id = f"skill-{skill_name.lower().replace(' ', '-')}"
            project_node_id = f"project-{node_id}"
            edges.append({
                "id": f"edge-project-{project_node_id}-internship",
                "source": project_node_id,
                "target": "internship",
                "animated": True,
                "style": {"stroke": "#ec4899"}
            })

        return {"nodes": nodes, "edges": edges}

career_gps_service = CareerGPSService()
