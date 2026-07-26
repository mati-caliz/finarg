from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "postgresql+psycopg2://labrecha:labrecha123@localhost:5432/labrecha"
    http_timeout_seconds: float = 30.0
    http_user_agent: str = "labrecha-scraper/0.1 (+https://labrecha.ar)"
    log_dir: str = ""
    log_max_bytes: int = 5_000_000
    log_backup_count: int = 5
    error_retention_days: int = 90
    error_max_rows: int = 5000


settings = Settings()
