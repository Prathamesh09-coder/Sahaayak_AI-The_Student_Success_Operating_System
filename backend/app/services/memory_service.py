import json
from typing import List, Dict, Any, Optional
import time

_cache = {}

TTL_24_HOURS = 86400

async def store_recent_message(conversation_id: str, message: Dict[str, Any]):
    key = f"chat:{conversation_id}:messages"
    if key not in _cache:
        _cache[key] = {"data": [], "expires": time.time() + TTL_24_HOURS}
    _cache[key]["data"].append(message)
    _cache[key]["expires"] = time.time() + TTL_24_HOURS
    
    # Cap list to last 50 messages
    _cache[key]["data"] = _cache[key]["data"][-50:]

async def get_recent_messages(conversation_id: str) -> List[Dict[str, Any]]:
    key = f"chat:{conversation_id}:messages"
    if key in _cache and _cache[key]["expires"] > time.time():
        return _cache[key]["data"]
    return []

async def store_summary(conversation_id: str, summary: str):
    key = f"chat:{conversation_id}:summary"
    _cache[key] = {"data": summary, "expires": time.time() + TTL_24_HOURS}

async def get_summary(conversation_id: str) -> Optional[str]:
    key = f"chat:{conversation_id}:summary"
    if key in _cache and _cache[key]["expires"] > time.time():
        return _cache[key]["data"]
    return None

async def cache_context(student_id: str, context: Dict[str, Any]):
    key = f"student:{student_id}:context"
    _cache[key] = {"data": context, "expires": time.time() + TTL_24_HOURS}

async def get_cached_context(student_id: str) -> Optional[Dict[str, Any]]:
    key = f"student:{student_id}:context"
    if key in _cache and _cache[key]["expires"] > time.time():
        return _cache[key]["data"]
    return None

async def invalidate_context_cache(student_id: str):
    key = f"student:{student_id}:context"
    if key in _cache:
        del _cache[key]
