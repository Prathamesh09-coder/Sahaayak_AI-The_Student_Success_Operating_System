import sys
import os
import asyncio

# Add backend directory to path to allow direct script execution
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.core.security import hash_password
from app.db.session import AsyncSessionLocal

async def init_db(db: AsyncSession) -> None:
    # Check if admin already exists
    result = await db.execute(select(User).where(User.email == "admin@sahaayak.ai"))
    admin_user = result.scalars().first()
    
    if not admin_user:
        admin_user = User(
            email="admin@sahaayak.ai",
            hashed_password=hash_password("adminpassword123"), # Hardcoded just for seeder, ideally from env
            full_name="System Admin",
            role="ADMIN",
            is_active=True,
            is_verified=True
        )
        db.add(admin_user)
        await db.commit()
        print("Created default admin user")
    else:
        print("Default admin user already exists.")

async def main():
    async with AsyncSessionLocal() as db:
        await init_db(db)

if __name__ == "__main__":
    asyncio.run(main())
