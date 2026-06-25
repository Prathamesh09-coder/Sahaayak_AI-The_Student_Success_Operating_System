from typing import List, Dict, Any
from fastapi import WebSocket
from enum import Enum
import json

class EventType(Enum):
    TWIN_UPDATED = "twin.updated"
    GOAL_COMPLETED = "goal.completed"
    RISK_DETECTED = "risk.detected"
    DASHBOARD_REFRESH = "dashboard.refresh"
    NEW_RECOMMENDATION = "new.recommendation"
    SCHOLARSHIP_ALERT = "scholarship.alert"
    OPPORTUNITY_ALERT = "opportunity.alert"
    # Chat Events
    CHAT_STARTED = "chat.started"
    MESSAGE_SENT = "message.sent"
    TOKEN_STREAM = "token.stream"
    MESSAGE_COMPLETED = "message.completed"
    MESSAGE_FAILED = "message.failed"
    # Career GPS Events
    ROADMAP_GENERATED = "roadmap.generated"
    STEP_COMPLETED = "step.completed"
    MILESTONE_COMPLETED = "milestone.completed"
    SKILL_ACQUIRED = "skill.acquired"
    ROADMAP_UPDATED = "roadmap.updated"
    # Phase 5 Events
    NEW_OPPORTUNITY = "new.opportunity"
    NEW_SCHOLARSHIP = "new.scholarship"
    DEADLINE_ALERT = "deadline.alert"
    INTERVENTION_CREATED = "intervention.created"
    APPLICATION_STATUS_CHANGED = "application_status.changed"
    NEW_NOTIFICATION = "new.notification"
    # Phase 6 Events
    MENTOR_MATCH_FOUND = "mentor.match_found"
    SESSION_REQUESTED = "session.requested"
    SESSION_CONFIRMED = "session.confirmed"
    NEW_POST = "community.new_post"
    NEW_COMMENT = "community.new_comment"
    COMMUNITY_RECOMMENDATION = "community.recommendation"
    NEW_SUCCESS_STORY = "story.new"
    # Phase 7 Events
    VOICE_SESSION_STARTED = "voice.started"
    VOICE_SESSION_COMPLETED = "voice.completed"
    PARENT_QUERY_COMPLETED = "parent.query_completed"
    ACCESSIBILITY_UPDATED = "accessibility.updated"
    # Phase 8 Events
    SUCCESS_INDEX_UPDATED = "success.index_updated"
    PREDICTION_GENERATED = "prediction.generated"
    FORECAST_UPDATED = "forecast.updated"
    RISK_LEVEL_CHANGED = "risk.level_changed"
    RECOMMENDATION_GENERATED = "recommendation.generated"
    KNOWLEDGE_GRAPH_UPDATED = "knowledge_graph.updated"
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.user_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str = None):
        await websocket.accept()
        self.active_connections.append(websocket)
        if user_id:
            self.user_connections[user_id] = websocket

    def disconnect(self, websocket: WebSocket, user_id: str = None):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if user_id and user_id in self.user_connections:
            del self.user_connections[user_id]

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass

    async def emit_event(self, event: EventType, payload: Any, user_id: str = None):
        message = json.dumps({
            "event": event.value,
            "payload": payload
        })
        
        if user_id and user_id in self.user_connections:
            try:
                await self.user_connections[user_id].send_text(message)
            except Exception:
                pass
        else:
            await self.broadcast(message)

manager = ConnectionManager()
