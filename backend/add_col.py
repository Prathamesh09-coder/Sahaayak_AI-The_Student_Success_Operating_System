import asyncio
from app.db.session import engine

async def add_column():
    async with engine.begin() as conn:
        from sqlalchemy import text
        try:
            await conn.execute(text("ALTER TABLE conversations ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE;"))
        except Exception as e:
            print("Already exists or error:", e)

asyncio.run(add_column())
