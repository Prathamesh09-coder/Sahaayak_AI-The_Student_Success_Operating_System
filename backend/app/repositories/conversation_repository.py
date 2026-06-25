from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.conversation import Conversation
import uuid

async def create_conversation(db: AsyncSession, student_id: str, title: str = "New Conversation") -> Conversation:
    conversation = Conversation(student_id=student_id, title=title)
    db.add(conversation)
    await db.commit()
    await db.refresh(conversation)
    return conversation

async def get_conversation(db: AsyncSession, conversation_id: str) -> Conversation:
    result = await db.execute(select(Conversation).filter(Conversation.id == conversation_id))
    return result.scalar_one_or_none()

async def get_student_conversations(db: AsyncSession, student_id: str) -> list[Conversation]:
    result = await db.execute(select(Conversation).filter(Conversation.student_id == student_id, Conversation.is_archived == False).order_by(Conversation.updated_at.desc()))
    return result.scalars().all()

async def archive_conversation(db: AsyncSession, conversation_id: str):
    conv = await get_conversation(db, conversation_id)
    if conv:
        conv.is_archived = True
        await db.commit()
