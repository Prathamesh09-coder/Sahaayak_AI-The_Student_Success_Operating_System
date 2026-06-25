import asyncio
from app.db.session import AsyncSessionLocal
from app.schemas.user import UserCreate
from app.services import auth_service

async def main():
    async with AsyncSessionLocal() as db:
        try:
            user_in = UserCreate(email="student3@test.com", password="password123", full_name="Test", role="student")
            user = await auth_service.signup(db, user_in)
            print("Signup successful:", user.id)
            from app.schemas.user import UserLogin
            token = await auth_service.login(db, UserLogin(email="student3@test.com", password="password123"))
            print("TOKEN:", token.access_token)
        except Exception as e:
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
