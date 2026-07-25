from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends, Query
from labrecha_db import PoliticalEvent
from sqlalchemy import select
from sqlalchemy.orm import Session

from labrecha_api.db import get_session
from labrecha_api.schemas import PoliticalEventOut

router = APIRouter(prefix="/political-events", tags=["political-events"])


@router.get("", response_model=list[PoliticalEventOut])
def list_political_events(
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    category: str | None = Query(default=None),
    session: Session = Depends(get_session),
) -> list[PoliticalEventOut]:
    conditions = []
    if date_from is not None:
        conditions.append(PoliticalEvent.date >= date_from)
    if date_to is not None:
        conditions.append(PoliticalEvent.date <= date_to)
    if category is not None:
        conditions.append(PoliticalEvent.category == category)

    statement = select(PoliticalEvent).where(*conditions).order_by(PoliticalEvent.date)
    return [
        PoliticalEventOut(
            date=event.date,
            title=event.title,
            category=event.category,
            description=event.description,
        )
        for event in session.scalars(statement).all()
    ]
