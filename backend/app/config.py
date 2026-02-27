from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Gemini API key
    gemini_api_key: str

    # Database
    database_url: str = "sqlite:///./reviews.db"

    # CORS
    cors_origins: str = "http://localhost:3000"

    # Scraper
    scraper_timeout: int = 30000

    # LLM retry
    max_retries: int = 2

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"


settings = Settings()