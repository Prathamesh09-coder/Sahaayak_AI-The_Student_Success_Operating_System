import time
from typing import Optional, List, Any

class MockRedis:
    def __init__(self):
        self.cache = {}
        
    async def get(self, key: str) -> Optional[str]:
        if key in self.cache:
            if self.cache[key]["expires"] and self.cache[key]["expires"] < time.time():
                del self.cache[key]
                return None
            return self.cache[key]["data"]
        return None
        
    async def set(self, key: str, value: str, ex: Optional[int] = None):
        self.cache[key] = {
            "data": value,
            "expires": time.time() + ex if ex else None
        }

    async def setex(self, key: str, time_sec: int, value: str):
        await self.set(key, value, ex=time_sec)
        
    async def delete(self, key: str):
        if key in self.cache:
            del self.cache[key]
            
    async def rpush(self, key: str, value: str):
        if key not in self.cache or not isinstance(self.cache[key].get("data"), list):
            self.cache[key] = {"data": [], "expires": None}
        self.cache[key]["data"].append(value)
        
    async def lrange(self, key: str, start: int, end: int) -> List[Any]:
        if key in self.cache and isinstance(self.cache[key]["data"], list):
            if self.cache[key]["expires"] and self.cache[key]["expires"] < time.time():
                del self.cache[key]
                return []
            if end == -1:
                return self.cache[key]["data"][start:]
            return self.cache[key]["data"][start:end+1]
        return []
        
    async def expire(self, key: str, time_sec: int):
        if key in self.cache:
            self.cache[key]["expires"] = time.time() + time_sec
            
    def pipeline(self):
        return MockRedisPipeline(self)
        
    async def close(self):
        pass

class MockRedisPipeline:
    def __init__(self, parent: MockRedis):
        self.parent = parent
        self.commands = []
        
    def rpush(self, key: str, value: str):
        self.commands.append(("rpush", key, value))
        return self
        
    def expire(self, key: str, time_sec: int):
        self.commands.append(("expire", key, time_sec))
        return self
        
    async def execute(self):
        for cmd in self.commands:
            if cmd[0] == "rpush":
                await self.parent.rpush(cmd[1], cmd[2])
            elif cmd[0] == "expire":
                await self.parent.expire(cmd[1], cmd[2])

redis_client = MockRedis()
