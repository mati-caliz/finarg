from datetime import date, datetime
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, Field


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


class CompoundingFrequency(str, Enum):
    MONTHLY = "MONTHLY"
    QUARTERLY = "QUARTERLY"
    YEARLY = "YEARLY"

    @property
    def periods_per_year(self) -> int:
        return {"MONTHLY": 12, "QUARTERLY": 4, "YEARLY": 1}[self.value]


class CompoundInterestRequest(BaseModel):
    initial_capital: Decimal = Field(gt=0)
    annual_rate: Decimal = Field(ge=0, le=200)
    years: int = Field(ge=1, le=50)
    compounding_frequency: CompoundingFrequency
    periodic_contribution: Decimal = Field(default=Decimal(0), ge=0)


class CompoundInterestPeriod(BaseModel):
    period: int
    principal: Decimal
    interest: Decimal
    total: Decimal


class CompoundInterestResponse(BaseModel):
    final_amount: Decimal
    total_contributions: Decimal
    total_interest: Decimal
    periods: list[CompoundInterestPeriod]


class InflationAdjustmentRequest(BaseModel):
    amount: Decimal = Field(gt=0)
    from_date: date
    to_date: date


class InflationAdjustmentResponse(BaseModel):
    original_amount: Decimal
    adjusted_amount: Decimal
    from_date: date
    to_date: date
    cumulative_inflation: Decimal
    months_elapsed: int
