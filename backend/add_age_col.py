import asyncio
from app.db.session import engine
from sqlalchemy import text

async def add_column():
    async with engine.begin() as conn:
        try:
            await conn.execute(text("ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS age INTEGER;"))
            print("Successfully added age column to student_profiles table!")
        except Exception as e:
            print("Error adding column:", e)

if __name__ == "__main__":
    asyncio.run(add_column())
