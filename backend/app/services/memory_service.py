import redis.asyncio as redis
import os
import json
from typing import List, Dict, Any, Optional

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
redis_client = redis.from_url(REDIS_URL, decode_responses=True)

TTL_24_HOURS = 86400

async def store_recent_message(conversation_id: str, message: Dict[str, Any]):
    key = f"chat:{conversation_id}:messages"
    await redis_client.rpush(key, json.dumps(message))
    await redis_client.expire(key, TTL_24_HOURS)
    
    # Cap list to last 50 messages to avoid runaway memory
    await redis_client.ltrim(key, -50, -1)

async def get_recent_messages(conversation_id: str) -> List[Dict[str, Any]]:
    key = f"chat:{conversation_id}:messages"
    messages = await redis_client.lrange(key, 0, -1)
    return [json.loads(m) for m in messages] if messages else []

async def store_summary(conversation_id: str, summary: str):
    key = f"chat:{conversation_id}:summary"
    await redis_client.set(key, summary, ex=TTL_24_HOURS)

async def get_summary(conversation_id: str) -> Optional[str]:
    key = f"chat:{conversation_id}:summary"
    return await redis_client.get(key)

async def cache_context(student_id: str, context: Dict[str, Any]):
    key = f"student:{student_id}:context"
    await redis_client.set(key, json.dumps(context), ex=TTL_24_HOURS)

async def get_cached_context(student_id: str) -> Optional[Dict[str, Any]]:
    key = f"student:{student_id}:context"
    data = await redis_client.get(key)
    return json.loads(data) if data else None

async def invalidate_context_cache(student_id: str):
    key = f"student:{student_id}:context"
    await redis_client.delete(key)

