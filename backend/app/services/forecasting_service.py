from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Dict, Any, List
from app.models.forecast_history import ForecastHistory
from app.models.success_index import SuccessIndex
from app.models.success_index_history import SuccessIndexHistory
import uuid
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class ForecastingService:
    async def get_student_forecast(self, db: AsyncSession, student_profile_id: str) -> Dict[str, Any]:
        """Fetch current forecast projections from the database. Calculate and save if none exist."""
        result = await db.execute(
            select(ForecastHistory).where(ForecastHistory.student_id == student_profile_id)
        )
        forecasts = result.scalars().all()

        if not forecasts:
            # Generate and save
            await self.generate_forecast_and_save(db, student_profile_id)
            # Re-fetch
            result = await db.execute(
                select(ForecastHistory).where(ForecastHistory.student_id == student_profile_id)
            )
            forecasts = result.scalars().all()

        # Format to match API contract:
        # { "30_days": X, "90_days": Y, "180_days": Z }
        response = {
            "30_days": 80,
            "90_days": 85,
            "180_days": 90
        }

        for f in forecasts:
            score = int(f.predicted_score)
            if "30" in f.forecast_window:
                response["30_days"] = score
            elif "90" in f.forecast_window:
                response["90_days"] = score
            elif "180" in f.forecast_window:
                response["180_days"] = score

        return response

    async def generate_forecast_and_save(self, db: AsyncSession, student_profile_id: str) -> List[ForecastHistory]:
        """Compute future success projections (30, 90, 180 days) based on student progress velocity and save to PostgreSQL."""
        # Fetch success index
        result = await db.execute(
            select(SuccessIndex).where(SuccessIndex.student_id == student_profile_id)
        )
        idx = result.scalar_one_or_none()
        current_score = idx.overall_score if idx else 75.0

        # Look at historical progression to compute "velocity" (progress slope)
        history_result = await db.execute(
            select(SuccessIndexHistory)
            .where(SuccessIndexHistory.student_id == student_profile_id)
            .order_by(SuccessIndexHistory.created_at.desc())
            .limit(3)
        )
        history = history_result.scalars().all()

        velocity = 1.5 # Default positive progress rate per month
        if len(history) >= 2:
            # Simple slope calculation (most recent score minus oldest score in snapshot)
            diff = history[0].overall_score - history[-1].overall_score
            if diff != 0:
                velocity = max(-3.0, min(5.0, diff / len(history))) # Bound velocity to realistic figures

        # Project scores out for 30 days (1 month), 90 days (3 months), 180 days (6 months)
        proj_30 = min(100.0, max(0.0, current_score + (velocity * 1.0)))
        proj_90 = min(100.0, max(0.0, current_score + (velocity * 3.0)))
        proj_180 = min(100.0, max(0.0, current_score + (velocity * 6.0)))

        # Round to integers
        proj_30 = round(proj_30, 1)
        proj_90 = round(proj_90, 1)
        proj_180 = round(proj_180, 1)

        forecasts = [
            {"window": "30_DAYS", "score": proj_30},
            {"window": "90_DAYS", "score": proj_90},
            {"window": "180_DAYS", "score": proj_180}
        ]

        # Delete existing forecasts to prevent duplicates
        existing = await db.execute(
            select(ForecastHistory).where(ForecastHistory.student_id == student_profile_id)
        )
        for old in existing.scalars().all():
            await db.delete(old)

        saved_forecasts = []
        for f in forecasts:
            history_forecast = ForecastHistory(
                id=str(uuid.uuid4()),
                student_id=student_profile_id,
                forecast_window=f["window"],
                predicted_score=f["score"]
            )
            db.add(history_forecast)
            saved_forecasts.append(history_forecast)

        await db.commit()
        logger.info(f"[Forecast] Saved 30, 90, 180 days forecast history for student: {student_profile_id}")
        return saved_forecasts

forecasting_service = ForecastingService()
