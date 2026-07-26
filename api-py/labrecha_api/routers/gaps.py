from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from datetime import date
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from labrecha_db import IndicatorHistory
from sqlalchemy import func, select, tuple_
from sqlalchemy.orm import Session

from labrecha_api.db import get_session
from labrecha_api.schemas import GapExclusion, GapMeasurement, GapOut

router = APIRouter(prefix="/gaps", tags=["gaps"])

MIN_SOURCES = 2
DEFAULT_LIMIT = 30
MAX_LIMIT = 200
PERCENT = 100

MISSING_UNIT_REASON = "sin unidad declarada en la medición"


@dataclass(frozen=True)
class Measurement:
    source: str
    value: Decimal
    unit: str | None


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
) -> dict[str, list[Measurement]]:
    if not latest_by_code:
        return {}
    statement = select(
        IndicatorHistory.indicator_code,
        IndicatorHistory.source,
        IndicatorHistory.value,
        IndicatorHistory.meta,
    ).where(
        tuple_(IndicatorHistory.indicator_code, IndicatorHistory.date).in_(
            list(latest_by_code.items())
        )
    )
    grouped: dict[str, list[Measurement]] = defaultdict(list)
    for code, source, value, meta in session.execute(statement):
        declared_unit = (meta or {}).get("unit")
        unit = str(declared_unit) if declared_unit else None
        grouped[code].append(Measurement(source=source, value=value, unit=unit))
    return grouped


def _comparable_unit(measurements: list[Measurement]) -> str | None:
    by_unit: dict[str, list[Measurement]] = defaultdict(list)
    for measurement in measurements:
        if measurement.unit is not None:
            by_unit[measurement.unit].append(measurement)
    comparable = [unit for unit, group in by_unit.items() if len(group) >= MIN_SOURCES]
    if not comparable:
        return None
    return min(comparable, key=lambda unit: (-len(by_unit[unit]), unit))


def _exclusion_reason(measurement: Measurement, unit: str) -> str | None:
    if measurement.unit is None:
        return MISSING_UNIT_REASON
    if measurement.unit != unit:
        return f"unidad distinta: {measurement.unit} (se compara en {unit})"
    return None


def _build_gap(code: str, day: date, measurements: list[Measurement]) -> GapOut | None:
    unit = _comparable_unit(measurements)
    if unit is None:
        return None

    excluded = [
        GapExclusion(source=measurement.source, reason=reason)
        for measurement in sorted(measurements, key=lambda item: item.source)
        if (reason := _exclusion_reason(measurement, unit)) is not None
    ]
    comparable = [measurement for measurement in measurements if measurement.unit == unit]
    if len(comparable) < MIN_SOURCES:
        return None

    ordered = sorted(comparable, key=lambda item: item.value, reverse=True)
    higher, lower = ordered[0], ordered[-1]
    spread = higher.value - lower.value
    base = abs(lower.value)
    gap_pct = float(spread / base * PERCENT) if base != 0 else 0.0

    return GapOut(
        indicator_code=code,
        date=day,
        higher_source=higher.source,
        higher_value=higher.value,
        lower_source=lower.source,
        lower_value=lower.value,
        spread=spread,
        gap_pct=round(gap_pct, 4),
        unit=unit,
        measurements=[
            GapMeasurement(source=measurement.source, value=measurement.value)
            for measurement in ordered
        ],
        excluded_sources=excluded,
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
            status_code=404,
            detail=(
                f"sin brecha calculable para '{indicator_code}': "
                "no hay dos fuentes que declaren la misma unidad"
            ),
        )
    return gap
