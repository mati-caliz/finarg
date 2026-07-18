from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "postgresql+psycopg2://finarg:finarg123@localhost:5432/finarg"
    http_timeout_seconds: float = 30.0
    http_user_agent: str = "labrecha-scraper/0.1 (+https://labrecha.ar)"


settings = Settings()
