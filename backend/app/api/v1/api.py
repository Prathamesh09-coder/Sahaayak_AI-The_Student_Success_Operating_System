from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.api.v1 import auth, users, health, onboarding, digital_twin, dashboard, chat, career_gps, opportunities, scholarships, interventions, mentors, mentor, community, sessions, success_stories, voice, resume, parent, accessibility, success, analytics, predictions, admin, knowledge_graph

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(onboarding.router, prefix="/onboarding", tags=["onboarding"])
api_router.include_router(digital_twin.router, prefix="/digital-twin", tags=["digital_twin"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(mentor.router, prefix="/mentor", tags=["mentor"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(career_gps.router, prefix="/career-gps", tags=["career_gps"])
api_router.include_router(opportunities.router, prefix="/opportunities", tags=["opportunities"])
api_router.include_router(scholarships.router, prefix="/scholarships", tags=["scholarships"])
api_router.include_router(interventions.router, prefix="/interventions", tags=["interventions"])
api_router.include_router(mentors.router, prefix="/mentors", tags=["mentors"])
api_router.include_router(community.router, prefix="/community", tags=["community"])
api_router.include_router(sessions.router, prefix="/sessions", tags=["sessions"])
api_router.include_router(success_stories.router, prefix="/success-stories", tags=["success_stories"])
api_router.include_router(voice.router, prefix="/voice", tags=["voice"])
api_router.include_router(resume.router, prefix="/resume", tags=["resume"])
api_router.include_router(parent.router, prefix="/parent", tags=["parent"])
api_router.include_router(accessibility.router, prefix="/accessibility", tags=["accessibility"])
api_router.include_router(success.router, prefix="/success", tags=["success"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(predictions.router, prefix="/predictions", tags=["predictions"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(knowledge_graph.router, prefix="/knowledge-graph", tags=["knowledge_graph"])


@api_router.websocket("/ws")
async def global_websocket(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            # Echo or ignore
    except WebSocketDisconnect:
        pass
