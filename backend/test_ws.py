import asyncio
import websockets

async def test():
    uri = "ws://localhost:8000/api/v1/ws"
    async with websockets.connect(uri) as websocket:
        print("Global WS Connected!")
        
    uri2 = "ws://localhost:8000/api/v1/chat/ws/chat/test_student_id"
    async with websockets.connect(uri2) as websocket:
        print("Chat WS Connected!")

asyncio.run(test())
