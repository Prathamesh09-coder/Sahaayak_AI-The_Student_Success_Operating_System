from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.message import Message
import uuid

import json
from app.core.redis import redis_client

async def save_message(
    db: AsyncSession, 
    conversation_id: str, 
    role: str, 
    content: str, 
    language: str = "en",
    retrieved_sources: list = None,
    response_time_ms: int = None,
    tokens_used: int = None,
    cost: float = None
) -> Message:
    message = Message(
        conversation_id=conversation_id,
        role=role,
        content=content,
        language=language,
        retrieved_sources=retrieved_sources,
        response_time_ms=response_time_ms,
        tokens_used=tokens_used,
        cost=cost
    )
    db.add(message)
    await db.commit()
    await db.refresh(message)
    
    # Update Redis cache
    cache_key = f"chat:{conversation_id}:recent_messages"
    msg_data = {
        "id": str(message.id),
        "role": role,
        "content": content,
        "language": language
    }
    await redis_client.rpush(cache_key, json.dumps(msg_data))
    await redis_client.expire(cache_key, 86400) # 24 hours
    
    return message

async def get_conversation_history(db: AsyncSession, conversation_id: str) -> list[Message]:
    cache_key = f"chat:{conversation_id}:recent_messages"
    
    # Try Redis
    cached = await redis_client.lrange(cache_key, 0, -1)
    if cached:
        # Convert JSON back to mock Message objects for the service layer
        class MockMessage:
            def __init__(self, d):
                self.role = d.get("role")
                self.content = d.get("content")
        return [MockMessage(json.loads(c)) for c in cached]
        
    # Fallback to DB
    result = await db.execute(select(Message).filter(Message.conversation_id == conversation_id).order_by(Message.created_at.asc()))
    messages = result.scalars().all()
    
    # Populate Redis
    if messages:
        pipe = redis_client.pipeline()
        for m in messages:
            msg_data = {"id": str(m.id), "role": m.role, "content": m.content, "language": m.language}
            pipe.rpush(cache_key, json.dumps(msg_data))
        pipe.expire(cache_key, 86400)
        await pipe.execute()
        
    return messages

async def get_message(db: AsyncSession, message_id: str) -> Message:
    result = await db.execute(select(Message).filter(Message.id == message_id))
    return result.scalar_one_or_none()
