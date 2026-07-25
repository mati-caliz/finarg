from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from labrecha_db import IndicatorHistory
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from labrecha_api.db import get_session
from labrecha_api.schemas import (
    IndicatorPoint,
    IndicatorSeries,
    IndicatorSourceSummary,
    IndicatorSummary,
)

router = APIRouter(prefix="/indicators", tags=["indicators"])

DEFAULT_LIMIT = 5000
MAX_LIMIT = 50000


@router.get("", response_model=list[IndicatorSummary])
def list_indicators(session: Session = Depends(get_session)) -> list[IndicatorSummary]:
    statement = (
        select(
            IndicatorHistory.indicator_code,
            func.array_agg(func.distinct(IndicatorHistory.source)),
            func.count(),
            func.min(IndicatorHistory.date),
            func.max(IndicatorHistory.date),
        )
        .group_by(IndicatorHistory.indicator_code)
        .order_by(IndicatorHistory.indicator_code)
    )
    return [
        IndicatorSummary(
            indicator_code=code,
            sources=sorted(sources),
            count=count,
            first_date=first_date,
            last_date=last_date,
        )
        for code, sources, count, first_date, last_date in session.execute(statement)
    ]


@router.get("/{indicator_code}/sources", response_model=list[IndicatorSourceSummary])
def list_indicator_sources(
    indicator_code: str, session: Session = Depends(get_session)
) -> list[IndicatorSourceSummary]:
    aggregate = (
        select(
            IndicatorHistory.source.label("source"),
            func.count().label("count"),
            func.min(IndicatorHistory.date).label("first_date"),
            func.max(IndicatorHistory.date).label("last_date"),
        )
        .where(IndicatorHistory.indicator_code == indicator_code)
        .group_by(IndicatorHistory.source)
        .subquery()
    )
    statement = (
        select(
            aggregate.c.source,
            aggregate.c.count,
            aggregate.c.first_date,
            aggregate.c.last_date,
            IndicatorHistory.value,
        )
        .join(
            IndicatorHistory,
            (IndicatorHistory.source == aggregate.c.source)
            & (IndicatorHistory.date == aggregate.c.last_date)
            & (IndicatorHistory.indicator_code == indicator_code),
        )
        .order_by(aggregate.c.source)
    )
    results = [
        IndicatorSourceSummary(
            source=source,
            count=count,
            first_date=first_date,
            last_date=last_date,
            latest_value=latest_value,
        )
        for source, count, first_date, last_date, latest_value in session.execute(statement)
    ]
    if not results:
        raise HTTPException(status_code=404, detail=f"indicador desconocido: {indicator_code}")
    return results


@router.get("/{indicator_code}", response_model=IndicatorSeries)
def get_indicator_series(
    indicator_code: str,
    source: str | None = Query(default=None),
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    limit: int = Query(default=DEFAULT_LIMIT, ge=1, le=MAX_LIMIT),
    order: str = Query(default="asc", pattern="^(asc|desc)$"),
    session: Session = Depends(get_session),
) -> IndicatorSeries:
    conditions = [IndicatorHistory.indicator_code == indicator_code]
    if source is not None:
        conditions.append(IndicatorHistory.source == source)
    if date_from is not None:
        conditions.append(IndicatorHistory.date >= date_from)
    if date_to is not None:
        conditions.append(IndicatorHistory.date <= date_to)

    ordering = IndicatorHistory.date.asc() if order == "asc" else IndicatorHistory.date.desc()
    statement = (
        select(IndicatorHistory)
        .where(*conditions)
        .order_by(ordering, IndicatorHistory.source)
        .limit(limit)
    )
    rows = session.scalars(statement).all()
    if not rows:
        raise HTTPException(
            status_code=404,
            detail=f"sin datos para indicador '{indicator_code}' con los filtros dados",
        )
    return IndicatorSeries(
        indicator_code=indicator_code,
        points=[
            IndicatorPoint(date=row.date, value=row.value, source=row.source, meta=row.meta or {})
            for row in rows
        ],
    )
