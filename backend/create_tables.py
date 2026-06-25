import asyncio
from app.models.base import Base
import pkgutil
import importlib
import app.models

# Import all modules in app.models
for _, module_name, _ in pkgutil.iter_modules(app.models.__path__):
    if module_name != "base":
        importlib.import_module(f"app.models.{module_name}")

from app.db.session import engine

async def main():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Tables created successfully!")

if __name__ == "__main__":
    asyncio.run(main())
