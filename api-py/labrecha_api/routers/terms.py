from __future__ import annotations

from collections import Counter
from datetime import date
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from labrecha_db import IndicatorHistory
from sqlalchemy import select
from sqlalchemy.orm import Session

from labrecha_api.clock import today_in_argentina
from labrecha_api.db import get_session
from labrecha_api.government_terms import TERMS, GovernmentTerm
from labrecha_api.schemas import IndicatorTermsOut, IndicatorTermStat, TermMethod

router = APIRouter(prefix="/terms", tags=["terms"])

PERCENT = Decimal(100)
MONTHS_PER_YEAR = Decimal(12)
DAYS_PER_MONTH = Decimal("30.4375")

MONTHLY_RATE_INDICATORS = {"cpi_monthly"}


def _method_for(indicator_code: str) -> TermMethod:
    return (
        TermMethod.COMPOUNDED if indicator_code in MONTHLY_RATE_INDICATORS else TermMethod.ENDPOINTS
    )


def _compound(values: list[Decimal]) -> Decimal:
    accumulated = Decimal(1)
    for value in values:
        accumulated *= Decimal(1) + value / PERCENT
    return (accumulated - Decimal(1)) * PERCENT


def _annualize(total_change_pct: Decimal, first: date, last: date) -> Decimal | None:
    months = Decimal((last - first).days) / DAYS_PER_MONTH
    if months <= 0:
        return None
    growth = Decimal(1) + total_change_pct / PERCENT
    if growth <= 0:
        return None
    exponent = MONTHS_PER_YEAR / months
    annualized = Decimal(pow(float(growth), float(exponent))) - Decimal(1)
    return annualized * PERCENT


def _most_covered_source(rows: list[tuple[date, Decimal, str]]) -> str:
    counts = Counter(row_source for _, _, row_source in rows)
    return counts.most_common(1)[0][0]


def _term_stat(
    term: GovernmentTerm,
    points: list[tuple[date, Decimal]],
    method: TermMethod,
) -> IndicatorTermStat | None:
    if not points:
        return None

    first_date, first_value = points[0]
    last_date, last_value = points[-1]

    values = [value for _, value in points]
    average = sum(values, Decimal(0)) / Decimal(len(values))
    if method is TermMethod.COMPOUNDED:
        change = _compound(values)
    elif first_value != 0:
        change = (last_value - first_value) / abs(first_value) * PERCENT
    else:
        change = Decimal(0)

    return IndicatorTermStat(
        term_id=term.term_id,
        president=term.president,
        start=term.start,
        end=term.end,
        first_date=first_date,
        last_date=last_date,
        first_value=first_value,
        last_value=last_value,
        average=average,
        points=len(points),
        change_pct=change,
        annualized_pct=_annualize(change, first_date, last_date),
    )


@router.get("/{indicator_code}", response_model=IndicatorTermsOut)
def indicator_by_term(
    indicator_code: str,
    source: str | None = Query(default=None),
    session: Session = Depends(get_session),
) -> IndicatorTermsOut:
    conditions = [IndicatorHistory.indicator_code == indicator_code]
    if source is not None:
        conditions.append(IndicatorHistory.source == source)

    statement = (
        select(IndicatorHistory.date, IndicatorHistory.value, IndicatorHistory.source)
        .where(*conditions)
        .order_by(IndicatorHistory.date)
    )
    rows = session.execute(statement).all()
    if not rows:
        raise HTTPException(status_code=404, detail=f"sin datos para '{indicator_code}'")

    resolved_source = source if source is not None else _most_covered_source(rows)
    series = [(day, value) for day, value, row_source in rows if row_source == resolved_source]
    if not series:
        raise HTTPException(
            status_code=404, detail=f"sin datos de '{resolved_source}' para '{indicator_code}'"
        )

    method = _method_for(indicator_code)
    stats: list[IndicatorTermStat] = []
    for term in TERMS:
        end = term.end if term.end is not None else today_in_argentina()
        window = [(day, value) for day, value in series if term.start <= day <= end]
        stat = _term_stat(term, window, method)
        if stat is not None:
            stats.append(stat)

    return IndicatorTermsOut(
        indicator_code=indicator_code,
        source=resolved_source,
        method=method,
        terms=stats,
    )
