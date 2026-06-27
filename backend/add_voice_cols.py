import asyncio
from app.db.session import engine
from sqlalchemy import text

async def add_voice_columns():
    async with engine.begin() as conn:
        columns_to_add = [
            ("conversation_id", "VARCHAR"),
            ("messages_count", "INTEGER DEFAULT 0"),
            ("started_at", "TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP"),
            ("ended_at", "TIMESTAMP WITH TIME ZONE"),
            ("emotion", "VARCHAR DEFAULT 'neutral'"),
            ("status", "VARCHAR DEFAULT 'active'")
        ]
        
        for col_name, col_type in columns_to_add:
            try:
                # We try to add the column, catch if already exists
                await conn.execute(text(f"ALTER TABLE voice_sessions ADD COLUMN {col_name} {col_type};"))
                print(f"Added column {col_name}")
            except Exception as e:
                print(f"Column {col_name} already exists or error: {e}")

if __name__ == "__main__":
    asyncio.run(add_voice_columns())
