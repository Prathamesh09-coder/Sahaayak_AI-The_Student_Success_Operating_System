from fastapi import APIRouter, Depends
from typing import Dict, Any

router = APIRouter()

@router.get("", response_model=Dict[str, Any])
async def health_check():
    # In a real app, you would inject DB and Redis clients here and ping them
    # For now, we simulate a healthy response as requested
    return {
        "success": True,
        "message": "Health check successful",
        "data": {
            "status": "healthy",
            "database": "connected",
            "redis": "connected"
        }
    }
