import asyncio
import asyncpg

async def main():
    conn = await asyncpg.connect('postgresql://postgres:postgres@localhost:5432/postgres')
    try:
        await conn.execute('CREATE DATABASE sahaayak_db')
        print("Database sahaayak_db created successfully!")
    except asyncpg.exceptions.DuplicateDatabaseError:
        print("Database already exists.")
    finally:
        await conn.close()

asyncio.run(main())
