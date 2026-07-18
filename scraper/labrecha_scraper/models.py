from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    BigInteger,
    Boolean,
    Date,
    DateTime,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class IndicatorHistory(Base):
    __tablename__ = "indicator_history"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    indicator_code: Mapped[str] = mapped_column(String(80))
    source: Mapped[str] = mapped_column(String(40))
    date: Mapped[date] = mapped_column(Date)
    value: Mapped[Decimal] = mapped_column(Numeric(24, 6))
    meta: Mapped[dict] = mapped_column(JSONB, default=dict)

    __table_args__ = (
        UniqueConstraint("indicator_code", "source", "date", name="uq_indicator_source_date"),
        Index("ix_indicator_code_date", "indicator_code", "date"),
    )


class ScrapeRun(Base):
    __tablename__ = "scrape_runs"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    job_name: Mapped[str] = mapped_column(String(60))
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(20))
    rows_upserted: Mapped[int] = mapped_column(BigInteger, default=0)
    error: Mapped[str | None] = mapped_column(Text, nullable=True)

    __table_args__ = (Index("ix_scrape_runs_job_started", "job_name", "started_at"),)


class PoliticalEvent(Base):
    __tablename__ = "political_events"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    date: Mapped[date] = mapped_column(Date)
    title: Mapped[str] = mapped_column(String(200))
    category: Mapped[str] = mapped_column(String(60))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    __table_args__ = (
        UniqueConstraint("date", "title", name="uq_event_date_title"),
        Index("ix_political_events_date", "date"),
    )


class CongressVote(Base):
    __tablename__ = "congress_votes"

    acta_id: Mapped[str] = mapped_column(String(20), primary_key=True)
    session_source_id: Mapped[str | None] = mapped_column(String(40), nullable=True)
    period_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    period_type: Mapped[str | None] = mapped_column(String(40), nullable=True)
    session_type: Mapped[str | None] = mapped_column(String(60), nullable=True)
    meeting_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    session_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    ballot_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    date: Mapped[date | None] = mapped_column(Date, nullable=True)
    time: Mapped[str | None] = mapped_column(String(10), nullable=True)
    majority_base: Mapped[str | None] = mapped_column(String(60), nullable=True)
    majority_type: Mapped[str | None] = mapped_column(String(60), nullable=True)
    title: Mapped[str | None] = mapped_column(Text, nullable=True)
    result: Mapped[str | None] = mapped_column(String(40), nullable=True)
    president_name: Mapped[str | None] = mapped_column(String(160), nullable=True)
    affirmative_votes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    negative_votes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    abstentions: Mapped[int | None] = mapped_column(Integer, nullable=True)
    absents: Mapped[int | None] = mapped_column(Integer, nullable=True)

    __table_args__ = (Index("ix_congress_votes_date", "date"),)


class CongressVoteDetail(Base):
    __tablename__ = "congress_vote_details"

    vote_detail_id: Mapped[str] = mapped_column(String(20), primary_key=True)
    acta_id: Mapped[str] = mapped_column(String(20))
    deputy_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    bloc: Mapped[str | None] = mapped_column(String(200), nullable=True)
    district: Mapped[str | None] = mapped_column(String(120), nullable=True)
    vote: Mapped[str | None] = mapped_column(String(20), nullable=True)

    __table_args__ = (
        Index("ix_congress_vote_details_acta", "acta_id"),
        Index("ix_congress_vote_details_bloc", "bloc"),
    )


class Holiday(Base):
    __tablename__ = "holidays"

    date: Mapped[date] = mapped_column(Date, primary_key=True)
    name: Mapped[str] = mapped_column(String(160), primary_key=True)
    local_name: Mapped[str | None] = mapped_column(String(160), nullable=True)
    is_global: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    is_fixed: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    types: Mapped[str | None] = mapped_column(String(120), nullable=True)
