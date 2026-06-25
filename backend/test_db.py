import asyncio
import asyncpg
import traceback

async def test_auth(user, password):
    try:
        conn = await asyncpg.connect(f'postgresql://{user}:{password}@localhost:5432/sahaayak_db')
        print(f"SUCCESS: user='{user}' password='{password}'")
        await conn.close()
        return True
    except Exception as e:
        print(f"Failed {user}:{password} -> {repr(e)}")
        return False

async def main():
    combos = [
        ('postgres', 'postgres')
    ]
    for u, p in combos:
        await test_auth(u, p)

asyncio.run(main())
