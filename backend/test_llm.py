import asyncio
from app.llm.nvidia_client import nvidia_client

async def test():
    try:
        messages = [{"role": "user", "content": "Hello"}]
        print("Testing NVIDIA Client...")
        async for chunk in nvidia_client.chat(messages, stream=True):
            print("Received:", chunk)
    except Exception as e:
        print("Error:", e)

asyncio.run(test())
