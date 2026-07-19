from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import BigInteger, Date, DateTime, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class IndicatorHistory(Base):
    __tablename__ = "indicator_history"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    indicator_code: Mapped[str] = mapped_column(String(80))
    source: Mapped[str] = mapped_column(String(40))
    date: Mapped[date] = mapped_column(Date)
    value: Mapped[Decimal] = mapped_column(Numeric(24, 6))
    meta: Mapped[dict] = mapped_column(JSONB)


class PoliticalEvent(Base):
    __tablename__ = "political_events"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    date: Mapped[date] = mapped_column(Date)
    title: Mapped[str] = mapped_column(String(200))
    category: Mapped[str] = mapped_column(String(60))
    description: Mapped[str | None] = mapped_column(Text)


class ScrapeRun(Base):
    __tablename__ = "scrape_runs"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    job_name: Mapped[str] = mapped_column(String(60))
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    status: Mapped[str] = mapped_column(String(20))
    rows_upserted: Mapped[int] = mapped_column(BigInteger)
    error: Mapped[str | None] = mapped_column(Text)
