from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Sahaayak AI"
    ENVIRONMENT: str = "development"
    SECRET_KEY: str = "default-secret-key"
    DATABASE_URL: str = "sqlite+aiosqlite:///./sahaayak.db"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    API_V1_PREFIX: str = "/api/v1"
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:8080",
        "http://localhost:8081",
        "http://localhost:8082",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:8081",
        "http://127.0.0.1:8082",
        "http://localhost:5173"
    ]

    # NVIDIA Config
    NVIDIA_API_KEY: str = "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"
    NVIDIA_CHAT_MODEL: str = "qwen/qwen3-next-80b-a3b-instruct"
    NVIDIA_BASE_URL: str = "https://integrate.api.nvidia.com/v1/chat/completions"
    NVIDIA_EMBEDDING_MODEL: str = "nvidia/nv-embedqa-e5-v5"

    # Neo4j Config
    NEO4J_URI: str = "neo4j://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = "password"

    # JWT Config
    ALGORITHM: str = "HS256"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
