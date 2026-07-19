from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel


class IndicatorSourceSummary(BaseModel):
    source: str
    count: int
    first_date: date
    last_date: date
    latest_value: Decimal


class IndicatorSummary(BaseModel):
    indicator_code: str
    sources: list[str]
    count: int
    first_date: date
    last_date: date


class IndicatorPoint(BaseModel):
    date: date
    value: Decimal
    source: str
    meta: dict


class IndicatorSeries(BaseModel):
    indicator_code: str
    points: list[IndicatorPoint]


class PoliticalEventOut(BaseModel):
    date: date
    title: str
    category: str
    description: str | None


class ScrapeRunOut(BaseModel):
    job_name: str
    status: str
    started_at: datetime
    finished_at: datetime | None
    rows_upserted: int
    error: str | None


class CongressVoteOut(BaseModel):
    acta_id: str
    period_number: int | None
    session_type: str | None
    date: date | None
    title: str | None
    result: str | None
    president_name: str | None
    affirmative_votes: int | None
    negative_votes: int | None
    abstentions: int | None
    absents: int | None


class CongressVoteDetailOut(BaseModel):
    acta_id: str
    deputy_name: str | None
    bloc: str | None
    district: str | None
    vote: str | None


class SenatorOut(BaseModel):
    senator_id: str
    last_name: str | None
    first_name: str | None
    bloc: str | None
    province: str | None
    party: str | None
    mandate_start: date | None
    mandate_end: date | None


class BlocSummary(BaseModel):
    bloc: str | None
    count: int


class HolidayOut(BaseModel):
    date: date
    name: str
    local_name: str | None
    is_global: bool | None
    is_fixed: bool | None
    types: str | None


class NewsArticleOut(BaseModel):
    title: str
    summary: str
    source: str
    source_url: str
    category: str
    published_date: datetime
    image_url: str | None
