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
