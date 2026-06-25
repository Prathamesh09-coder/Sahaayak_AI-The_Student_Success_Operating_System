import re

with open("app/api/v1/api.py", "r") as f:
    content = f.read()

ws_import = "from fastapi import APIRouter, WebSocket, WebSocketDisconnect\n"
content = content.replace("from fastapi import APIRouter\n", ws_import)

ws_route = """

@api_router.websocket("/ws")
async def global_websocket(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            # Echo or ignore
    except WebSocketDisconnect:
        pass
"""

content = content + ws_route

with open("app/api/v1/api.py", "w") as f:
    f.write(content)
