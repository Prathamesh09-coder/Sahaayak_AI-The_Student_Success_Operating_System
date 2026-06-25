import httpx
from app.core.config import settings
import json

class NvidiaClient:
    async def chat(self, messages: list, stream: bool = False):
        headers = {
            "Authorization": f"Bearer {settings.NVIDIA_API_KEY}",
            "Accept": "text/event-stream" if stream else "application/json"
        }
        
        payload = {
            "model": settings.NVIDIA_CHAT_MODEL,
            "messages": messages,
            "max_tokens": 16384,
            "temperature": 0.60,
            "top_p": 0.95,
            "top_k": 20,
            "presence_penalty": 0,
            "repetition_penalty": 1,
            "stream": stream,
        }

        async with httpx.AsyncClient(timeout=120) as client:
            if stream:
                async with client.stream("POST", "https://integrate.api.nvidia.com/v1/chat/completions", json=payload, headers=headers) as response:
                    response.raise_for_status()
                    async for line in response.aiter_lines():
                        if line:
                            # Standard SSE format yields 'data: {...}'
                            if line.startswith("data: "):
                                yield line[6:]
            else:
                response = await client.post("https://integrate.api.nvidia.com/v1/chat/completions", json=payload, headers=headers)
                response.raise_for_status()
                yield response.json()

nvidia_client = NvidiaClient()
