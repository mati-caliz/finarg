from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy import extract, select
from sqlalchemy.orm import Session

from labrecha_api.db import get_session
from labrecha_api.models import Holiday
from labrecha_api.schemas import HolidayOut

router = APIRouter(prefix="/holidays", tags=["holidays"])


@router.get("", response_model=list[HolidayOut])
def list_holidays(
    year: int | None = Query(default=None),
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    session: Session = Depends(get_session),
) -> list[HolidayOut]:
    conditions = []
    if year is not None:
        conditions.append(extract("year", Holiday.date) == year)
    if date_from is not None:
        conditions.append(Holiday.date >= date_from)
    if date_to is not None:
        conditions.append(Holiday.date <= date_to)

    statement = select(Holiday).where(*conditions).order_by(Holiday.date, Holiday.name)
    return [
        HolidayOut(
            date=holiday.date,
            name=holiday.name,
            local_name=holiday.local_name,
            is_global=holiday.is_global,
            is_fixed=holiday.is_fixed,
            types=holiday.types,
        )
        for holiday in session.scalars(statement).all()
    ]
