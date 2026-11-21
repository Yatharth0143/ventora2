from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    # MongoDB
    MONGODB_URI: str = ""
    MONGODB_DB_NAME: str = "ventora"

    # Neo4j
    NEO4J_URI: str = ""
    NEO4J_USERNAME: str = ""
    NEO4J_PASSWORD: str = ""
    NEO4J_DATABASE: str = ""

    # Sarvam AI
    SARVAM_API_KEY: str = ""
    SARVAM_API_URL: str = "https://api.sarvam.ai"

    # Bhashini
    BHASHINI_UDYAT_KEY: str = ""
    BHASHINI_INFERENCE_KEY: str = ""
    BHASHINI_API_URL: str = "https://dhruva-api.bhashini.gov.in/services/inference"

    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""

    # App Security
    SECRET_KEY: str = "ventora-dev-secret"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_HOURS: int = 24

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    # App
    APP_ENV: str = "development"
    APP_PORT: int = 8000

    model_config = ConfigDict(
        env_file=["../.env", ".env"],
        extra="ignore",
    )


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

