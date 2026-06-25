import asyncio
from datetime import timedelta
from app.core.security import create_access_token

async def main():
    # Create a token that expires in 365 days for dev
    token = create_access_token(
        subject="4af0524d-264c-4927-9a62-af2b6c712105",
        expires_delta=timedelta(days=365)
    )
    print("New Token:", token)

if __name__ == "__main__":
    asyncio.run(main())
