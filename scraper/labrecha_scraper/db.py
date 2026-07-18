from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from labrecha_scraper.config import settings

engine = create_engine(settings.database_url, pool_pre_ping=True, future=True)

SessionLocal = sessionmaker(bind=engine, class_=Session, expire_on_commit=False, future=True)
