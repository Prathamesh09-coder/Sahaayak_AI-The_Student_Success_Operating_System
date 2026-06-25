import asyncio
from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config
from alembic import context
import os
import sys

# Append parent dir to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.core.config import settings
from app.models.base import Base
from app.models.user import User, RefreshToken
from app.models.student_profile import StudentProfile
from app.models.family_profile import FamilyProfile
from app.models.career_profile import CareerProfile
from app.models.student_goal import StudentGoal
from app.models.assessment_profile import AssessmentProfile
from app.models.digital_twin import DigitalTwin
from app.models.digital_twin_history import DigitalTwinHistory
from app.models.student_activity import StudentActivity
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.student_memory import StudentMemory
from app.models.career_path import CareerPath
from app.models.skill import Skill
from app.models.course import Course
from app.models.student_skill import StudentSkill
from app.models.roadmap import Roadmap
from app.models.milestone import Milestone
from app.models.roadmap_step import RoadmapStep
from app.models.opportunity import Opportunity
from app.models.scholarship import Scholarship
from app.models.student_application import StudentApplication
from app.models.deadline_alert import DeadlineAlert
from app.models.intervention import Intervention
from app.models.opportunity_match import OpportunityMatch
from app.models.scholarship_match import ScholarshipMatch
from app.models.notification import Notification
# Phase 6 Models
from app.models.mentor import Mentor
from app.models.mentor_session import MentorSession
from app.models.mentor_match import MentorMatch
from app.models.peer_connection import PeerConnection
from app.models.community_group import CommunityGroup
from app.models.group_membership import GroupMembership
from app.models.discussion_post import DiscussionPost
from app.models.post_comment import PostComment
from app.models.success_story import SuccessStory
# Phase 7 Models
from app.models.parent_profile import ParentProfile
from app.models.parent_interaction import ParentInteraction
from app.models.voice_session import VoiceSession
# Phase 8 Models
from app.models.success_index import SuccessIndex
from app.models.success_index_history import SuccessIndexHistory
from app.models.predictive_insight import PredictiveInsight
from app.models.success_recommendation import SuccessRecommendation
from app.models.forecast_history import ForecastHistory
# Phase 9 Models
from app.models.audit_log import AuditLog
from app.models.feature_flag import FeatureFlag

config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def run_migrations_offline() -> None:
    url = settings.DATABASE_URL
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()

async def run_async_migrations() -> None:
    configuration = config.get_section(config.config_ini_section, {})
    configuration["sqlalchemy.url"] = settings.DATABASE_URL
    connectable = async_engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()

def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
