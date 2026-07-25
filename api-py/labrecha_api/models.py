from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import BigInteger, Boolean, Date, DateTime, Integer, Numeric, String, Text
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


class CongressVote(Base):
    __tablename__ = "congress_votes"

    vote_record_id: Mapped[str] = mapped_column(String(20), primary_key=True)
    period_number: Mapped[int | None] = mapped_column(Integer)
    session_type: Mapped[str | None] = mapped_column(String(60))
    date: Mapped[date | None] = mapped_column(Date)
    title: Mapped[str | None] = mapped_column(Text)
    result: Mapped[str | None] = mapped_column(String(40))
    president_name: Mapped[str | None] = mapped_column(String(160))
    affirmative_votes: Mapped[int | None] = mapped_column(Integer)
    negative_votes: Mapped[int | None] = mapped_column(Integer)
    abstentions: Mapped[int | None] = mapped_column(Integer)
    absents: Mapped[int | None] = mapped_column(Integer)


class CongressVoteDetail(Base):
    __tablename__ = "congress_vote_details"

    vote_detail_id: Mapped[str] = mapped_column(String(20), primary_key=True)
    vote_record_id: Mapped[str] = mapped_column(String(20))
    deputy_name: Mapped[str | None] = mapped_column(String(200))
    bloc: Mapped[str | None] = mapped_column(String(200))
    district: Mapped[str | None] = mapped_column(String(120))
    vote: Mapped[str | None] = mapped_column(String(20))


class SanctionedLaw(Base):
    __tablename__ = "sanctioned_laws"

    law_number: Mapped[str] = mapped_column(String(20), primary_key=True)
    project_id: Mapped[str | None] = mapped_column(String(40))
    sanctioning_chamber: Mapped[str | None] = mapped_column(String(40))
    initial_file: Mapped[str | None] = mapped_column(String(40))
    first_half_sanction: Mapped[date | None] = mapped_column(Date)
    second_half_sanction: Mapped[date | None] = mapped_column(Date)
    final_sanction: Mapped[date | None] = mapped_column(Date)
    title: Mapped[str | None] = mapped_column(Text)
    summary: Mapped[str | None] = mapped_column(Text)


class RentByNeighborhood(Base):
    __tablename__ = "rent_by_neighborhood"

    neighborhood: Mapped[str] = mapped_column(String(80), primary_key=True)
    commune: Mapped[str | None] = mapped_column(String(20))
    date: Mapped[date] = mapped_column(Date)
    price: Mapped[Decimal] = mapped_column(Numeric(16, 2))
    rooms: Mapped[str | None] = mapped_column(String(20))


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


class TaxChange(Base):
    __tablename__ = "tax_changes"

    regulation_id: Mapped[str] = mapped_column(String(40), primary_key=True)
    date: Mapped[date] = mapped_column(Date)
    change_type: Mapped[str] = mapped_column(String(20))
    tax_name: Mapped[str] = mapped_column(Text)
    jurisdiction: Mapped[str] = mapped_column(String(20))
    title: Mapped[str] = mapped_column(Text)
    url: Mapped[str] = mapped_column(String(300))


class Senator(Base):
    __tablename__ = "senators"

    senator_id: Mapped[str] = mapped_column(String(20), primary_key=True)
    last_name: Mapped[str | None] = mapped_column(String(120))
    first_name: Mapped[str | None] = mapped_column(String(120))
    bloc: Mapped[str | None] = mapped_column(String(160))
    province: Mapped[str | None] = mapped_column(String(80))
    party: Mapped[str | None] = mapped_column(String(160))
    mandate_start: Mapped[date | None] = mapped_column(Date)
    mandate_end: Mapped[date | None] = mapped_column(Date)
    email: Mapped[str | None] = mapped_column(String(160))
    photo_url: Mapped[str | None] = mapped_column(String(300))


class Holiday(Base):
    __tablename__ = "holidays"

    date: Mapped[date] = mapped_column(Date, primary_key=True)
    name: Mapped[str] = mapped_column(String(160), primary_key=True)
    local_name: Mapped[str | None] = mapped_column(String(160))
    is_global: Mapped[bool | None] = mapped_column(Boolean)
    is_fixed: Mapped[bool | None] = mapped_column(Boolean)
    types: Mapped[str | None] = mapped_column(String(120))


class NewsArticle(Base):
    __tablename__ = "news_articles"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    title: Mapped[str] = mapped_column(String(500))
    summary: Mapped[str] = mapped_column(String(1000))
    source: Mapped[str] = mapped_column(String(255))
    source_url: Mapped[str] = mapped_column(String(2048))
    category: Mapped[str] = mapped_column(String(255))
    published_date: Mapped[datetime] = mapped_column(DateTime)
    image_url: Mapped[str | None] = mapped_column(String(1000))


class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    slug: Mapped[str] = mapped_column(String(160), unique=True)
    title: Mapped[str] = mapped_column(String(200))
    category: Mapped[str] = mapped_column(String(40))
    summary: Mapped[str | None] = mapped_column(Text)
    content: Mapped[str] = mapped_column(Text)
    impacts: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    published: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
