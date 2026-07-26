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

    vote_record_id: Mapped[str] = mapped_column(String(20), primary_key=True)
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
    vote_record_id: Mapped[str] = mapped_column(String(20))
    deputy_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    bloc: Mapped[str | None] = mapped_column(String(200), nullable=True)
    district: Mapped[str | None] = mapped_column(String(120), nullable=True)
    vote: Mapped[str | None] = mapped_column(String(20), nullable=True)

    __table_args__ = (
        Index("ix_congress_vote_details_vote_record", "vote_record_id"),
        Index("ix_congress_vote_details_bloc", "bloc"),
    )


class CongressVoteSummary(Base):
    __tablename__ = "congress_vote_summaries"

    vote_record_id: Mapped[str] = mapped_column(String(20), primary_key=True)
    # summary/topic en NULL = la votación ya se intentó resumir y no se pudo (el acta no
    # cita expediente, o el expediente no está en el dataset de proyectos de HCDN). La fila
    # existe igual para marcar el intento: sin ella la votación volvería a ocupar lugar en
    # la ventana de cada corrida y el backfill nunca avanzaría. Se reintenta después de
    # RETRY_UNRESOLVED_AFTER_DAYS por si el dataset de HCDN incorpora el proyecto más tarde.
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    topic: Mapped[str | None] = mapped_column(String(40), nullable=True)
    file_numbers: Mapped[str | None] = mapped_column(Text, nullable=True)
    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class NewsArticle(Base):
    __tablename__ = "news_articles"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(500))
    content: Mapped[str] = mapped_column(Text, deferred=True)
    summary: Mapped[str] = mapped_column(String(1000))
    source: Mapped[str] = mapped_column(String(255))
    source_url: Mapped[str] = mapped_column(String(2048), unique=True)
    country: Mapped[str] = mapped_column(String(255))
    category: Mapped[str] = mapped_column(String(255))
    published_date: Mapped[datetime] = mapped_column(DateTime)
    image_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    is_official: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    created_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class Senator(Base):
    __tablename__ = "senators"

    senator_id: Mapped[str] = mapped_column(String(20), primary_key=True)
    last_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    first_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    bloc: Mapped[str | None] = mapped_column(String(160), nullable=True)
    province: Mapped[str | None] = mapped_column(String(80), nullable=True)
    party: Mapped[str | None] = mapped_column(String(160), nullable=True)
    mandate_start: Mapped[date | None] = mapped_column(Date, nullable=True)
    mandate_end: Mapped[date | None] = mapped_column(Date, nullable=True)
    email: Mapped[str | None] = mapped_column(String(160), nullable=True)
    photo_url: Mapped[str | None] = mapped_column(String(300), nullable=True)

    __table_args__ = (
        Index("ix_senators_bloc", "bloc"),
        Index("ix_senators_province", "province"),
    )


class SanctionedLaw(Base):
    __tablename__ = "sanctioned_laws"

    law_number: Mapped[str] = mapped_column(String(20), primary_key=True)
    project_id: Mapped[str | None] = mapped_column(String(40), nullable=True)
    sanctioning_chamber: Mapped[str | None] = mapped_column(String(40), nullable=True)
    initial_file: Mapped[str | None] = mapped_column(String(40), nullable=True)
    first_half_sanction: Mapped[date | None] = mapped_column(Date, nullable=True)
    second_half_sanction: Mapped[date | None] = mapped_column(Date, nullable=True)
    final_sanction: Mapped[date | None] = mapped_column(Date, nullable=True)
    title: Mapped[str | None] = mapped_column(Text, nullable=True)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)

    __table_args__ = (Index("ix_sanctioned_laws_final", "final_sanction"),)


class RentByNeighborhood(Base):
    __tablename__ = "rent_by_neighborhood"

    neighborhood: Mapped[str] = mapped_column(String(80), primary_key=True)
    commune: Mapped[str | None] = mapped_column(String(20), nullable=True)
    date: Mapped[date] = mapped_column(Date)
    price: Mapped[Decimal] = mapped_column(Numeric(16, 2))
    rooms: Mapped[str | None] = mapped_column(String(20), nullable=True)


class RevenueSharingShare(Base):
    __tablename__ = "revenue_sharing_shares"

    province: Mapped[str] = mapped_column(String(60), primary_key=True)
    coefficient: Mapped[Decimal] = mapped_column(Numeric(12, 8))
    source: Mapped[str] = mapped_column(String(40))


class GazetteSummary(Base):
    __tablename__ = "gazette_summaries"

    regulation_id: Mapped[str] = mapped_column(String(40), primary_key=True)
    date: Mapped[date] = mapped_column(Date)
    section: Mapped[str] = mapped_column(String(40))
    title: Mapped[str] = mapped_column(Text)
    summary: Mapped[str] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(40))
    url: Mapped[str] = mapped_column(String(300))

    __table_args__ = (Index("ix_gazette_summaries_date", "date"),)


class TaxChange(Base):
    __tablename__ = "tax_changes"

    regulation_id: Mapped[str] = mapped_column(String(40), primary_key=True)
    date: Mapped[date] = mapped_column(Date)
    change_type: Mapped[str] = mapped_column(String(20))
    tax_name: Mapped[str] = mapped_column(Text)
    jurisdiction: Mapped[str] = mapped_column(String(20))
    title: Mapped[str] = mapped_column(Text)
    url: Mapped[str] = mapped_column(String(300))

    __table_args__ = (Index("ix_tax_changes_date", "date"),)


class Holiday(Base):
    __tablename__ = "holidays"

    date: Mapped[date] = mapped_column(Date, primary_key=True)
    name: Mapped[str] = mapped_column(String(160), primary_key=True)
    local_name: Mapped[str | None] = mapped_column(String(160), nullable=True)
    is_global: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    is_fixed: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    types: Mapped[str | None] = mapped_column(String(120), nullable=True)


class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    slug: Mapped[str] = mapped_column(String(160), unique=True)
    title: Mapped[str] = mapped_column(String(200))
    category: Mapped[str] = mapped_column(String(40))
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    content: Mapped[str] = mapped_column(Text)
    impacts: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    published: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    __table_args__ = (Index("ix_posts_published_created", "published", "created_at"),)
