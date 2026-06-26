from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.logging import setup_logging, logger
import app.models
from app.api.v1.api import api_router
from app.core.exceptions import BaseAPIException

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup logging
    setup_logging()
    # Startup log
    logger.info("Starting up Sahaayak AI backend...")

        
    # Start APScheduler
    from apscheduler.schedulers.asyncio import AsyncIOScheduler
    from app.jobs.scheduler import start_scheduler
    app.state.scheduler = AsyncIOScheduler()
    start_scheduler(app.state.scheduler)
    app.state.scheduler.start()
    logger.info("APScheduler started")
        
    yield
    
    # Clean up
    app.state.scheduler.shutdown()
    logger.info("APScheduler shutdown")


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    lifespan=lifespan
)

# CORS Configuration
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include Routers
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

# Exception Handlers
@app.exception_handler(BaseAPIException)
async def custom_api_exception_handler(request: Request, exc: BaseAPIException):
    logger.warning(f"API Exception: {exc.detail} - Path: {request.url.path}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.detail,
            "data": None
        }
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled Exception on path {request.url.path}: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "An unexpected internal server error occurred",
            "data": None
        }
    )
