from __future__ import annotations

from collections import defaultdict
from datetime import date
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from labrecha_db import IndicatorHistory
from sqlalchemy import func, select, tuple_
from sqlalchemy.orm import Session

from labrecha_api.db import get_session
from labrecha_api.schemas import GapMeasurement, GapOut

router = APIRouter(prefix="/gaps", tags=["gaps"])

MIN_SOURCES = 2
DEFAULT_LIMIT = 30
MAX_LIMIT = 200
PERCENT = 100


def _latest_shared_dates(session: Session, min_sources: int) -> dict[str, date]:
    shared = (
        select(
            IndicatorHistory.indicator_code.label("indicator_code"),
            IndicatorHistory.date.label("date"),
        )
        .group_by(IndicatorHistory.indicator_code, IndicatorHistory.date)
        .having(func.count(func.distinct(IndicatorHistory.source)) >= min_sources)
        .subquery()
    )
    statement = select(shared.c.indicator_code, func.max(shared.c.date)).group_by(
        shared.c.indicator_code
    )
    return dict(session.execute(statement).all())


def _measurements_at(
    session: Session, latest_by_code: dict[str, date]
) -> dict[str, list[tuple[str, Decimal]]]:
    if not latest_by_code:
        return {}
    statement = select(
        IndicatorHistory.indicator_code,
        IndicatorHistory.source,
        IndicatorHistory.value,
    ).where(
        tuple_(IndicatorHistory.indicator_code, IndicatorHistory.date).in_(
            list(latest_by_code.items())
        )
    )
    grouped: dict[str, list[tuple[str, Decimal]]] = defaultdict(list)
    for code, source, value in session.execute(statement):
        grouped[code].append((source, value))
    return grouped


def _build_gap(code: str, day: date, measurements: list[tuple[str, Decimal]]) -> GapOut | None:
    if len(measurements) < MIN_SOURCES:
        return None
    ordered = sorted(measurements, key=lambda item: item[1], reverse=True)
    higher_source, higher_value = ordered[0]
    lower_source, lower_value = ordered[-1]
    spread = higher_value - lower_value
    base = abs(lower_value)
    gap_pct = float(spread / base * PERCENT) if base != 0 else 0.0

    return GapOut(
        indicator_code=code,
        date=day,
        higher_source=higher_source,
        higher_value=higher_value,
        lower_source=lower_source,
        lower_value=lower_value,
        spread=spread,
        gap_pct=round(gap_pct, 4),
        measurements=[GapMeasurement(source=source, value=value) for source, value in ordered],
    )


@router.get("", response_model=list[GapOut])
def list_gaps(
    limit: int = Query(default=DEFAULT_LIMIT, ge=1, le=MAX_LIMIT),
    min_sources: int = Query(default=MIN_SOURCES, ge=2),
    session: Session = Depends(get_session),
) -> list[GapOut]:
    latest_by_code = _latest_shared_dates(session, min_sources)
    grouped = _measurements_at(session, latest_by_code)

    gaps = [
        gap
        for code, day in latest_by_code.items()
        if (gap := _build_gap(code, day, grouped.get(code, []))) is not None
    ]
    gaps.sort(key=lambda item: abs(item.gap_pct), reverse=True)
    return gaps[:limit]


@router.get("/{indicator_code}", response_model=GapOut)
def get_gap(indicator_code: str, session: Session = Depends(get_session)) -> GapOut:
    latest_by_code = _latest_shared_dates(session, MIN_SOURCES)
    day = latest_by_code.get(indicator_code)
    if day is None:
        raise HTTPException(
            status_code=404,
            detail=f"'{indicator_code}' no tiene dos fuentes con dato en una misma fecha",
        )
    measurements = _measurements_at(session, {indicator_code: day}).get(indicator_code, [])
    gap = _build_gap(indicator_code, day, measurements)
    if gap is None:
        raise HTTPException(
            status_code=404, detail=f"sin brecha calculable para '{indicator_code}'"
        )
    return gap
