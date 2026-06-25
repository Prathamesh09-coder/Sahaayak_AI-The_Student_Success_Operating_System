import asyncio
from app.db.session import AsyncSessionLocal
from sqlalchemy import text
import uuid

async def main():
    async with AsyncSessionLocal() as db:
        try:
            profile_id = str(uuid.uuid4())
            await db.execute(text("""
                INSERT INTO student_profiles (id, user_id, college, branch, year, cgpa, city, state, country, preferred_language, bio, is_onboarding_completed, current_step, profile_completeness, created_at, updated_at)
                VALUES (:id, :user_id, :college, :branch, :year, :cgpa, :city, :state, :country, :preferred_language, :bio, :is_onboarding_completed, :current_step, :profile_completeness, now(), now())
            """), {
                "id": profile_id,
                "user_id": "4af0524d-264c-4927-9a62-af2b6c712105",
                "college": "Test College",
                "branch": "CS",
                "year": 1,
                "cgpa": 9.0,
                "city": "Pune",
                "state": "MH",
                "country": "India",
                "preferred_language": "English",
                "bio": "Test bio",
                "is_onboarding_completed": False,
                "current_step": 1,
                "profile_completeness": 10.0
            })
            await db.commit()
            print("Student profile created:", profile_id)
        except Exception as e:
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
