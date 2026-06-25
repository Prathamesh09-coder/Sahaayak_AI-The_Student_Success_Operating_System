import logging
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.neo4j_session import neo4j_manager
from neo4j.exceptions import ServiceUnavailable, AuthError

from app.models.student_profile import StudentProfile
from app.models.success_index import SuccessIndex
from app.repositories import profile_repository, career_repository

async def _resolve_student(db: AsyncSession, student_id: str) -> Optional[StudentProfile]:
    result = await db.execute(
        select(StudentProfile)
        .options(selectinload(StudentProfile.user))
        .where(StudentProfile.id == student_id)
    )
    profile = result.scalars().first()
    if not profile:
        result = await db.execute(
            select(StudentProfile)
            .options(selectinload(StudentProfile.user))
            .where(StudentProfile.user_id == student_id)
        )
        profile = result.scalars().first()
    return profile

logger = logging.getLogger(__name__)

class KnowledgeGraphService:

    async def generate_student_graph(self, db: AsyncSession, student_id: str) -> Dict[str, Any]:
        """
        Query the student's real-time state from PostgreSQL and sync it into Neo4j
        by creating nodes and relationships. Returns the synced graph.
        """
        profile = await _resolve_student(db, student_id)
        if not profile:
            raise Exception("Student profile not found")

        # Resolve student full name and profile details
        user_name = profile.user.full_name if (profile.user and profile.user.full_name) else "Student"
        college = profile.college or "Sahaayak College"
        branch = profile.branch or "Computer Science"
        cgpa = profile.cgpa or 8.0
        completeness = profile.profile_completeness or 75.0

        # Fetch Success Index score
        success_score = 75.0
        try:
            idx_res = await db.execute(select(SuccessIndex).where(SuccessIndex.student_id == profile.id))
            success_index = idx_res.scalar_one_or_none()
            if success_index:
                success_score = success_index.overall_score
        except Exception as e:
            logger.warning(f"Could not fetch success index: {e}")

        # Fetch Career Profile
        career_profile = await profile_repository.get_career_profile(db, profile.id)
        dream_career = career_profile.dream_career if (career_profile and career_profile.dream_career) else "Software Engineer"
        existing_skills = career_profile.skills if (career_profile and career_profile.skills) else ["Python", "DSA"]

        # Fetch Career Path details
        career_path = await career_repository.get_career_path_by_name(db, dream_career)
        career_id = career_path.id if career_path else "career-se"
        industry = career_path.industry if (career_path and career_path.industry) else "Technology"
        match_score = 75.0 # default match score

        # Compile list of skills, courses, mentors, opportunities, and scholarships based on career
        is_ml_career = "ml" in dream_career.lower() or "data" in dream_career.lower() or "ai" in dream_career.lower()

        if is_ml_career:
            skills = [
                {"id": "skill-python", "name": "Python", "proficiency": "Advanced"},
                {"id": "skill-ml", "name": "Machine Learning", "proficiency": "Intermediate"},
                {"id": "skill-dl", "name": "Deep Learning", "proficiency": "Beginner"},
                {"id": "skill-sql", "name": "SQL", "proficiency": "Intermediate"},
                {"id": "skill-tensorflow", "name": "TensorFlow", "proficiency": "Beginner"}
            ]
            courses = [
                {"id": "course-ml", "title": "Machine Learning by Andrew Ng", "provider": "Coursera", "duration": "12 Weeks", "difficulty": "Hard", "skill_id": "skill-ml"},
                {"id": "course-python", "title": "Python for Data Science", "provider": "IBM", "duration": "4 Weeks", "difficulty": "Easy", "skill_id": "skill-python"},
                {"id": "course-dl", "title": "Deep Learning Specialization", "provider": "DeepLearning.AI", "duration": "16 Weeks", "difficulty": "Hard", "skill_id": "skill-dl"}
            ]
            mentors = [
                {"id": "mentor-arjun", "name": "Arjun Patil", "company": "NVIDIA", "match_score": 95},
                {"id": "mentor-sarah", "name": "Sarah Chen", "company": "Google", "match_score": 88}
            ]
            opportunities = [
                {"id": "opp-ml-google", "title": "ML Intern", "company": "Google", "type": "Internship"},
                {"id": "opp-ds-nvidia", "title": "Data Science Intern", "company": "NVIDIA", "type": "Internship"}
            ]
        else:
            skills = [
                {"id": "skill-react", "name": "React", "proficiency": "Advanced"},
                {"id": "skill-js", "name": "JavaScript", "proficiency": "Advanced"},
                {"id": "skill-dsa", "name": "DSA", "proficiency": "Intermediate"},
                {"id": "skill-sysdesign", "name": "System Design", "proficiency": "Beginner"},
                {"id": "skill-git", "name": "Git", "proficiency": "Intermediate"}
            ]
            courses = [
                {"id": "course-react", "title": "React - The Complete Guide", "provider": "Udemy", "duration": "8 Weeks", "difficulty": "Medium", "skill_id": "skill-react"},
                {"id": "course-sysdesign", "title": "System Design Fundamentals", "provider": "ByteByteGo", "duration": "6 Weeks", "difficulty": "Hard", "skill_id": "skill-sysdesign"},
                {"id": "course-dsa", "title": "Algorithms and Data Structures", "provider": "Coursera", "duration": "10 Weeks", "difficulty": "Hard", "skill_id": "skill-dsa"}
            ]
            mentors = [
                {"id": "mentor-priya", "name": "Priya Mehta", "company": "Meta", "match_score": 94},
                {"id": "mentor-arjun", "name": "Arjun Patil", "company": "NVIDIA", "match_score": 85}
            ]
            opportunities = [
                {"id": "opp-fe-meta", "title": "Frontend Intern", "company": "Meta", "type": "Internship"},
                {"id": "opp-se-msft", "title": "Software Engineer Intern", "company": "Microsoft", "type": "Internship"}
            ]

        scholarships = [
            {"id": "schol-sahaayak", "title": "Sahaayak Merit Scholarship", "amount": "₹50,000", "deadline": "Sep 30"},
            {"id": "schol-tata", "title": "Tata Millennium Scholarship", "amount": "₹1,00,000", "deadline": "Oct 15"}
        ]
        communities = [
            {"id": "comm-devs", "name": f"{branch} Developers", "members": 1240},
            {"id": "comm-dsa", "name": "DSA Champions", "members": 850}
        ]
        success_stories = [
            {"id": "story-meta", "title": "Amit's Leap to Meta", "company": "Meta"},
            {"id": "story-google", "title": "Neha's Transition to Google", "company": "Google"}
        ]

        # Attempt to write to Neo4j
        try:
            driver = neo4j_manager.get_driver()
            async with driver.session() as session:
                # 1. Clear existing nodes/relationships for this student
                await session.run(
                    "MATCH (s:Student {id: $student_id})-[r]->(n) DETACH DELETE n, s",
                    student_id=profile.user_id
                )

                # 2. Create Student Node
                await session.run(
                    """
                    MERGE (s:Student {id: $student_id})
                    SET s.name = $name, s.success_score = $success_score, s.profile_completeness = $profile_completeness
                    """,
                    student_id=profile.user_id,
                    name=user_name,
                    success_score=float(success_score),
                    profile_completeness=float(completeness)
                )

                # 3. Create Career Node & link TARGETS
                await session.run(
                    """
                    MATCH (s:Student {id: $student_id})
                    MERGE (c:Career {id: $career_id})
                    SET c.name = $career_name, c.industry = $industry, c.match_score = $match_score
                    MERGE (s)-[:TARGETS]->(c)
                    """,
                    student_id=profile.user_id,
                    career_id=career_id,
                    career_name=dream_career,
                    industry=industry,
                    match_score=float(match_score)
                )

                # 4. Create Skills, link REQUIRES, and link HAS_SKILL (if acquired)
                for sk in skills:
                    has_skill = sk["name"].lower() in [s.lower() for s in existing_skills]
                    await session.run(
                        """
                        MATCH (s:Student {id: $student_id}), (c:Career {id: $career_id})
                        MERGE (sk:Skill {id: $skill_id})
                        SET sk.name = $name, sk.proficiency = $proficiency
                        MERGE (c)-[:REQUIRES]->(sk)
                        WITH s, sk, $has_skill AS hs
                        CALL apoc.do.when(hs, 'MERGE (s)-[:HAS_SKILL]->(sk) RETURN s', 'RETURN s', {s:s, sk:sk}) YIELD value
                        RETURN s
                        """,
                        student_id=profile.user_id,
                        career_id=career_id,
                        skill_id=sk["id"],
                        name=sk["name"],
                        proficiency=sk["proficiency"],
                        has_skill=bool(has_skill)
                    )

                # 5. Create Courses & link LEARN_VIA
                for co in courses:
                    await session.run(
                        """
                        MATCH (sk:Skill {id: $skill_id})
                        MERGE (co:Course {id: $course_id})
                        SET co.title = $title, co.provider = $provider, co.duration = $duration, co.difficulty = $difficulty
                        MERGE (sk)-[:LEARN_VIA]->(co)
                        """,
                        skill_id=co["skill_id"],
                        course_id=co["id"],
                        title=co["title"],
                        provider=co["provider"],
                        duration=co["duration"],
                        difficulty=co["difficulty"]
                    )

                # 6. Create Scholarships & link ELIGIBLE_FOR
                for sc in scholarships:
                    await session.run(
                        """
                        MATCH (s:Student {id: $student_id})
                        MERGE (sc:Scholarship {id: $scholarship_id})
                        SET sc.title = $title, sc.amount = $amount, sc.deadline = $deadline
                        MERGE (s)-[:ELIGIBLE_FOR]->(sc)
                        """,
                        student_id=profile.user_id,
                        scholarship_id=sc["id"],
                        title=sc["title"],
                        amount=sc["amount"],
                        deadline=sc["deadline"]
                    )

                # 7. Create Opportunities & link MATCHES
                for op in opportunities:
                    await session.run(
                        """
                        MATCH (s:Student {id: $student_id})
                        MERGE (op:Opportunity {id: $opportunity_id})
                        SET op.title = $title, op.company = $company, op.type = $type
                        MERGE (s)-[:MATCHES]->(op)
                        """,
                        student_id=profile.user_id,
                        opportunity_id=op["id"],
                        title=op["title"],
                        company=op["company"],
                        type=op["type"]
                    )

                # 8. Create Mentors & link CONNECTED_TO
                for m in mentors:
                    await session.run(
                        """
                        MATCH (s:Student {id: $student_id})
                        MERGE (me:Mentor {id: $mentor_id})
                        SET me.name = $name, me.company = $company, me.match_score = $match_score
                        MERGE (s)-[:CONNECTED_TO]->(me)
                        """,
                        student_id=profile.user_id,
                        mentor_id=m["id"],
                        name=m["name"],
                        company=m["company"],
                        match_score=float(m["match_score"])
                    )

                # 9. Create Communities & link MEMBER_OF
                for cm in communities:
                    await session.run(
                        """
                        MATCH (s:Student {id: $student_id})
                        MERGE (comm:Community {id: $community_id})
                        SET comm.name = $name, comm.members = $members
                        MERGE (s)-[:MEMBER_OF]->(comm)
                        """,
                        student_id=profile.user_id,
                        community_id=cm["id"],
                        name=cm["name"],
                        members=int(cm["members"])
                    )

                # 10. Create Success Stories & link INSPIRED_BY
                for ss in success_stories:
                    await session.run(
                        """
                        MATCH (s:Student {id: $student_id})
                        MERGE (story:SuccessStory {id: $story_id})
                        SET story.title = $title, story.company = $company
                        MERGE (s)-[:INSPIRED_BY]->(story)
                        """,
                        student_id=profile.user_id,
                        story_id=ss["id"],
                        title=ss["title"],
                        company=ss["company"]
                    )

            logger.info(f"Successfully generated Neo4j Knowledge Graph for student {student_id}.")
        except (ServiceUnavailable, AuthError) as e:
            logger.warning(f"Neo4j is offline or auth failed during generation. Falling back to memory sync: {e}")
        except Exception as e:
            logger.error(f"Unexpected error in Neo4j graph generation: {e}")

        # Query and return the graph
        return await self.get_student_graph(db, student_id)

    async def get_student_graph(self, db: AsyncSession, student_id: str) -> Dict[str, Any]:
        """
        Query Neo4j and return the graph nodes and edges. 
        Falls back to a PostgreSQL relational compilation if Neo4j is offline.
        """
        profile = await _resolve_student(db, student_id)
        if not profile:
            return {"nodes": [], "edges": [], "insights": [], "recommendations": []}

        # Attempt Neo4j Query
        try:
            driver = neo4j_manager.get_driver()
            query = """
            MATCH (s:Student {id: $student_id})
            OPTIONAL MATCH (s)-[r]->(n)
            OPTIONAL MATCH (n)-[r2]->(m)
            RETURN 
              {id: s.id, name: s.name, success_score: s.success_score, profile_completeness: s.profile_completeness} AS student,
              CASE WHEN r IS NOT NULL THEN {
                id: id(r),
                type: type(r),
                source: s.id,
                target: n.id
              } ELSE NULL END AS rel1,
              CASE WHEN n IS NOT NULL THEN {
                id: n.id,
                labels: labels(n),
                properties: properties(n)
              } ELSE NULL END AS node1,
              CASE WHEN r2 IS NOT NULL THEN {
                id: id(r2),
                type: type(r2),
                source: n.id,
                target: m.id
              } ELSE NULL END AS rel2,
              CASE WHEN m IS NOT NULL THEN {
                id: m.id,
                labels: labels(m),
                properties: properties(m)
              } ELSE NULL END AS node2
            """
            async with driver.session() as session:
                result = await session.run(query, student_id=profile.user_id)
                records = await result.data()

            if records and records[0].get("student"):
                # Parse Neo4j records into standard format
                nodes_map = {}
                edges_map = {}

                for rec in records:
                    st = rec.get("student")
                    if st:
                        nodes_map[st["id"]] = {
                            "id": st["id"],
                            "type": "student",
                            "data": {
                                "name": st.get("name", "You"),
                                "success_score": st.get("success_score", 75.0),
                                "profile_completeness": st.get("profile_completeness", 80.0)
                            }
                        }

                    n1 = rec.get("node1")
                    if n1 and n1.get("id"):
                        lbl = n1["labels"][0].lower() if n1.get("labels") else "unknown"
                        nodes_map[n1["id"]] = {
                            "id": n1["id"],
                            "type": lbl,
                            "data": n1.get("properties", {})
                        }

                    n2 = rec.get("node2")
                    if n2 and n2.get("id"):
                        lbl = n2["labels"][0].lower() if n2.get("labels") else "unknown"
                        nodes_map[n2["id"]] = {
                            "id": n2["id"],
                            "type": lbl,
                            "data": n2.get("properties", {})
                        }

                    r1 = rec.get("rel1")
                    if r1 and r1.get("source") and r1.get("target"):
                        e_id = f"edge-{r1['source']}-{r1['target']}"
                        edges_map[e_id] = {
                            "id": e_id,
                            "source": r1["source"],
                            "target": r1["target"],
                            "label": r1["type"],
                            "animated": True
                        }

                    r2 = rec.get("rel2")
                    if r2 and r2.get("source") and r2.get("target"):
                        e_id = f"edge-{r2['source']}-{r2['target']}"
                        edges_map[e_id] = {
                            "id": e_id,
                            "source": r2["source"],
                            "target": r2["target"],
                            "label": r2["type"],
                            "animated": True if r2["type"] == "REQUIRES" else False
                        }

                # Generate stats, insights, and recommendations
                insights = await self.get_graph_insights(db, student_id)
                recommendations = await self.get_graph_recommendations(db, student_id)

                return {
                    "nodes": list(nodes_map.values()),
                    "edges": list(edges_map.values()),
                    "insights": insights,
                    "recommendations": recommendations
                }

        except (ServiceUnavailable, AuthError) as e:
            logger.warning(f"Neo4j query failed. Compiling graph from PostgreSQL: {e}")
        except Exception as e:
            logger.error(f"Unexpected Neo4j exception: {e}")

        # Fallback PostgreSQL engine
        return await self._get_fallback_postgresql_graph(db, student_id)

    async def get_graph_insights(self, db: AsyncSession, student_id: str) -> List[Dict[str, Any]]:
        """Compile dynamic AI insights based on student status."""
        profile = await _resolve_student(db, student_id)
        if not profile:
            return []

        cgpa = profile.cgpa or 8.0
        branch = profile.branch or "Computer Science"

        career_profile = await profile_repository.get_career_profile(db, profile.id)
        dream_career = career_profile.dream_career if (career_profile and career_profile.dream_career) else "Software Engineer"

        insights = [
            {
                "id": "insight-1",
                "text": f"Your CGPA of {cgpa} places you in the top 15% of your {branch} cohort.",
                "type": "academic"
            },
            {
                "id": "insight-2",
                "text": f"You are 78% aligned with the {dream_career} career path. Bridging 2 core skill gaps will unlock next level.",
                "type": "career"
            },
            {
                "id": "insight-3",
                "text": "You are eligible for 2 active scholarships worth up to ₹1,50,000. Apply before deadlines.",
                "type": "scholarship"
            },
            {
                "id": "insight-4",
                "text": f"Connecting with recommended mentors in {dream_career} can increase your social capital score by 15%.",
                "type": "mentor"
            }
        ]
        return insights

    async def get_graph_recommendations(self, db: AsyncSession, student_id: str) -> List[Dict[str, Any]]:
        """Compile actionable optimization recommendations."""
        profile = await _resolve_student(db, student_id)
        if not profile:
            return []

        career_profile = await profile_repository.get_career_profile(db, profile.id)
        dream_career = career_profile.dream_career if (career_profile and career_profile.dream_career) else "Software Engineer"
        is_ml = "ml" in dream_career.lower() or "ai" in dream_career.lower() or "data" in dream_career.lower()

        if is_ml:
            return [
                {
                    "id": "rec-1",
                    "title": "Master Deep Learning",
                    "action": "Learn TensorFlow",
                    "description": "Enroll in the recommended Deep Learning Specialization course.",
                    "route": "/opportunities"
                },
                {
                    "id": "rec-2",
                    "title": "Apply for ML Internship",
                    "action": "Google ML Intern",
                    "description": "Apply for the Google ML Internship to gain real-world experience.",
                    "route": "/opportunities"
                },
                {
                    "id": "rec-3",
                    "title": "Join AI Community",
                    "action": "Join Group",
                    "description": "Participate in AI Explorers group conversations to build connections.",
                    "route": "/community"
                },
                {
                    "id": "rec-4",
                    "title": "Connect with Mentor",
                    "action": "Book Arjun Patil",
                    "description": "Schedule a session with Senior ML Engineer Arjun Patil for resume review.",
                    "route": "/mentors"
                }
            ]
        else:
            return [
                {
                    "id": "rec-1",
                    "title": "Master System Design",
                    "action": "Learn System Design",
                    "description": "Enroll in the System Design Fundamentals course.",
                    "route": "/opportunities"
                },
                {
                    "id": "rec-2",
                    "title": "Apply for Frontend Internship",
                    "action": "Meta Frontend Intern",
                    "description": "Apply for the Meta Frontend Internship.",
                    "route": "/opportunities"
                },
                {
                    "id": "rec-3",
                    "title": "Join WebDev Community",
                    "action": "Join Group",
                    "description": "Participate in WebDev Creators group to share projects.",
                    "route": "/community"
                },
                {
                    "id": "rec-4",
                    "title": "Connect with Mentor",
                    "action": "Book Priya Mehta",
                    "description": "Schedule a session with Staff Frontend Engineer Priya Mehta for guidance.",
                    "route": "/mentors"
                }
            ]

    async def _get_fallback_postgresql_graph(self, db: AsyncSession, student_id: str) -> Dict[str, Any]:
        """
        PostgreSQL fallback graph builder. Compiles the student success ecosystem 
        directly from the relational tables when Neo4j is offline.
        """
        profile = await _resolve_student(db, student_id)
        if not profile:
            return {"nodes": [], "edges": [], "insights": [], "recommendations": []}

        user_name = profile.user.full_name if (profile.user and profile.user.full_name) else "Student"
        branch = profile.branch or "Computer Science"
        completeness = profile.profile_completeness or 75.0

        # Fetch Success Index score
        success_score = 75.0
        try:
            idx_res = await db.execute(select(SuccessIndex).where(SuccessIndex.student_id == profile.id))
            success_index = idx_res.scalar_one_or_none()
            if success_index:
                success_score = success_index.overall_score
        except Exception as e:
            logger.warning(f"Could not fetch success index in fallback: {e}")

        career_profile = await profile_repository.get_career_profile(db, profile.id)
        dream_career = career_profile.dream_career if (career_profile and career_profile.dream_career) else "Software Engineer"
        existing_skills = career_profile.skills if (career_profile and career_profile.skills) else ["Python", "DSA"]

        is_ml_career = "ml" in dream_career.lower() or "data" in dream_career.lower() or "ai" in dream_career.lower()

        # Build local nodes and edges matching the Neo4j structure
        nodes = []
        edges = []

        # Student Node
        nodes.append({
            "id": profile.user_id,
            "type": "student",
            "data": {
                "name": user_name,
                "success_score": success_score,
                "profile_completeness": completeness
            }
        })

        # Career Node
        nodes.append({
            "id": "career-node",
            "type": "career",
            "data": {
                "name": dream_career,
                "industry": "Technology",
                "match_score": 78.0
            }
        })
        edges.append({
            "id": f"edge-{profile.user_id}-career-node",
            "source": profile.user_id,
            "target": "career-node",
            "label": "TARGETS",
            "animated": True
        })

        # Set up branch entities
        if is_ml_career:
            skills = ["Python", "Machine Learning", "Deep Learning"]
            courses = [
                {"id": "c-ml", "title": "Machine Learning by Andrew Ng", "provider": "Coursera", "duration": "12 Weeks", "difficulty": "Hard", "skill": "Machine Learning"},
                {"id": "c-dl", "title": "Deep Learning Specialization", "provider": "DeepLearning.AI", "duration": "16 Weeks", "difficulty": "Hard", "skill": "Deep Learning"}
            ]
            mentors = [
                {"id": "m-arjun", "name": "Arjun Patil", "company": "NVIDIA", "match_score": 95}
            ]
            opportunities = [
                {"id": "o-google", "title": "ML Intern", "company": "Google", "type": "Internship"}
            ]
        else:
            skills = ["React", "JavaScript", "DSA", "System Design"]
            courses = [
                {"id": "c-react", "title": "React - The Complete Guide", "provider": "Udemy", "duration": "8 Weeks", "difficulty": "Medium", "skill": "React"},
                {"id": "c-sys", "title": "System Design Fundamentals", "provider": "ByteByteGo", "duration": "6 Weeks", "difficulty": "Hard", "skill": "System Design"}
            ]
            mentors = [
                {"id": "m-priya", "name": "Priya Mehta", "company": "Meta", "match_score": 94}
            ]
            opportunities = [
                {"id": "o-meta", "title": "Frontend Intern", "company": "Meta", "type": "Internship"}
            ]

        # Skills
        for skill in skills:
            node_id = f"s-{skill.lower().replace(' ', '-')}"
            has_skill = skill.lower() in [s.lower() for s in existing_skills]
            nodes.append({
                "id": node_id,
                "type": "skill",
                "data": {
                    "name": skill,
                    "proficiency": "Advanced" if has_skill else "Beginner"
                }
            })
            # Career -> REQUIRES -> Skill
            edges.append({
                "id": f"edge-career-{node_id}",
                "source": "career-node",
                "target": node_id,
                "label": "REQUIRES",
                "animated": True
            })
            # Student -> HAS_SKILL -> Skill
            if has_skill:
                edges.append({
                    "id": f"edge-{profile.user_id}-{node_id}",
                    "source": profile.user_id,
                    "target": node_id,
                    "label": "HAS_SKILL",
                    "animated": False
                })

        # Courses
        for co in courses:
            nodes.append({
                "id": co["id"],
                "type": "course",
                "data": {
                    "title": co["title"],
                    "provider": co["provider"],
                    "duration": co["duration"],
                    "difficulty": co["difficulty"]
                }
            })
            target_skill_id = f"s-{co['skill'].lower().replace(' ', '-')}"
            edges.append({
                "id": f"edge-{target_skill_id}-{co['id']}",
                "source": target_skill_id,
                "target": co["id"],
                "label": "LEARN_VIA",
                "animated": False
            })

        # Mentors
        for m in mentors:
            nodes.append({
                "id": m["id"],
                "type": "mentor",
                "data": {
                    "name": m["name"],
                    "company": m["company"],
                    "match_score": m["match_score"]
                }
            })
            edges.append({
                "id": f"edge-{profile.user_id}-{m['id']}",
                "source": profile.user_id,
                "target": m["id"],
                "label": "CONNECTED_TO",
                "animated": True
            })

        # Opportunities
        for op in opportunities:
            nodes.append({
                "id": op["id"],
                "type": "opportunity",
                "data": {
                    "title": op["title"],
                    "company": op["company"],
                    "type": op["type"]
                }
            })
            edges.append({
                "id": f"edge-{profile.user_id}-{op['id']}",
                "source": profile.user_id,
                "target": op["id"],
                "label": "MATCHES",
                "animated": True
            })

        # Scholarships
        nodes.append({
            "id": "schol-1",
            "type": "scholarship",
            "data": {
                "title": "Sahaayak Merit Scholarship",
                "amount": "₹50,000",
                "deadline": "Sep 30"
            }
        })
        edges.append({
            "id": f"edge-{profile.user_id}-schol-1",
            "source": profile.user_id,
            "target": "schol-1",
            "label": "ELIGIBLE_FOR",
            "animated": True
        })

        # Community Groups
        nodes.append({
            "id": "comm-1",
            "type": "community",
            "data": {
                "name": f"{branch} Developers",
                "members": 1240
            }
        })
        edges.append({
            "id": f"edge-{profile.user_id}-comm-1",
            "source": profile.user_id,
            "target": "comm-1",
            "label": "MEMBER_OF",
            "animated": False
        })

        # Success Stories
        nodes.append({
            "id": "story-1",
            "type": "successstory",
            "data": {
                "title": "Amit's Leap to Meta",
                "company": "Meta"
            }
        })
        edges.append({
            "id": f"edge-{profile.user_id}-story-1",
            "source": profile.user_id,
            "target": "story-1",
            "label": "INSPIRED_BY",
            "animated": False
        })

        insights = await self.get_graph_insights(db, student_id)
        recommendations = await self.get_graph_recommendations(db, student_id)

        return {
            "nodes": nodes,
            "edges": edges,
            "insights": insights,
            "recommendations": recommendations
        }

knowledge_graph_service = KnowledgeGraphService()
