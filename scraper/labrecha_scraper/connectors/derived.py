from __future__ import annotations

from datetime import date
from decimal import Decimal

from labrecha_db import IndicatorHistory
from sqlalchemy import select
from sqlalchemy.orm import Session

from labrecha_scraper.base import Connector, IndicatorPoint, upsert_indicator_points

DERIVED_SOURCE = "labrecha"
CPI_CODE = "cpi_level_general"
CPI_SOURCE = "datosgobar"
DEFLATED_DECIMALS = Decimal("0.01")
RATE_DECIMALS = Decimal("0.0001")

DEFLATED_SERIES: dict[str, str] = {
    "minimum_wage": "minimum_wage_real",
    "pension_minimum": "pension_minimum_real",
}
DEFLATED_SOURCE = "datosgobar"

IMPLICIT_FX_CODE = "implicit_fx_rate"
IMPLICIT_FX_NUMERATOR = "monetary_base"
IMPLICIT_FX_DENOMINATOR = "international_reserves"
IMPLICIT_FX_SOURCE = "bcra"


def _load(session: Session, code: str, source: str) -> list[tuple[date, Decimal]]:
    statement = (
        select(IndicatorHistory.date, IndicatorHistory.value)
        .where(IndicatorHistory.indicator_code == code, IndicatorHistory.source == source)
        .order_by(IndicatorHistory.date)
    )
    return [(row_date, row_value) for row_date, row_value in session.execute(statement)]


def _by_month(series: list[tuple[date, Decimal]]) -> dict[tuple[int, int], Decimal]:
    return {(day.year, day.month): value for day, value in series}


def _deflated_points(session: Session, nominal_code: str, real_code: str) -> list[IndicatorPoint]:
    cpi = _load(session, CPI_CODE, CPI_SOURCE)
    nominal = _load(session, nominal_code, DEFLATED_SOURCE)
    if not cpi or not nominal:
        return []

    cpi_by_month = _by_month(cpi)
    base_month, base_index = cpi[-1][0], cpi[-1][1]
    if base_index == 0:
        return []

    points: list[IndicatorPoint] = []
    for day, value in nominal:
        index = cpi_by_month.get((day.year, day.month))
        if index is None or index == 0:
            continue
        points.append(
            IndicatorPoint(
                indicator_code=real_code,
                source=DERIVED_SOURCE,
                date=day,
                value=(value * base_index / index).quantize(DEFLATED_DECIMALS),
                meta={
                    "unit": "ARS",
                    "derived_from": [nominal_code, CPI_CODE],
                    "method": "deflactado por IPC nivel general",
                    "base_month": base_month.isoformat(),
                },
            )
        )
    return points


def _implicit_fx_points(session: Session) -> list[IndicatorPoint]:
    base = _load(session, IMPLICIT_FX_NUMERATOR, IMPLICIT_FX_SOURCE)
    reserves = dict(_load(session, IMPLICIT_FX_DENOMINATOR, IMPLICIT_FX_SOURCE))
    if not base or not reserves:
        return []

    points: list[IndicatorPoint] = []
    for day, base_value in base:
        reserve_value = reserves.get(day)
        if reserve_value is None or reserve_value <= 0:
            continue
        points.append(
            IndicatorPoint(
                indicator_code=IMPLICIT_FX_CODE,
                source=DERIVED_SOURCE,
                date=day,
                value=(base_value / reserve_value).quantize(RATE_DECIMALS),
                meta={
                    "unit": "ARS_por_USD",
                    "derived_from": [IMPLICIT_FX_NUMERATOR, IMPLICIT_FX_DENOMINATOR],
                    "method": "base monetaria sobre reservas internacionales, ambas del BCRA",
                },
            )
        )
    return points


class DerivedIndicatorsConnector(Connector):
    name = "derived"
    source = DERIVED_SOURCE

    def fetch(self) -> None:
        return None

    def persist(self, session: Session, _data: object) -> int:
        points: list[IndicatorPoint] = []
        for nominal_code, real_code in DEFLATED_SERIES.items():
            points.extend(_deflated_points(session, nominal_code, real_code))
        points.extend(_implicit_fx_points(session))
        return upsert_indicator_points(session, points)
