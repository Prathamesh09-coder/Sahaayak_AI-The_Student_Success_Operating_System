from neo4j import GraphDatabase, AsyncGraphDatabase
from app.core.config import settings

class Neo4jSessionManager:
    def __init__(self):
        self._driver = None

    def init_driver(self):
        self._driver = AsyncGraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD)
        )
    
    async def close(self):
        if self._driver:
            await self._driver.close()

    def get_driver(self):
        if not self._driver:
            self.init_driver()
        return self._driver

neo4j_manager = Neo4jSessionManager()

async def get_neo4j_session():
    driver = neo4j_manager.get_driver()
    async with driver.session() as session:
        yield session
