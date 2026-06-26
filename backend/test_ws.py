from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_websocket():
    with client.websocket_connect("/api/v1/ws") as websocket:
        print("Global WS Connected!")
        # We expect a success connection, no data immediately sent
