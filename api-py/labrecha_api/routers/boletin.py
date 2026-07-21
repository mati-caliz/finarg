from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from labrecha_api.db import get_session
from labrecha_api.models import BoletinSummary
from labrecha_api.schemas import BoletinSummaryOut

router = APIRouter(prefix="/boletin", tags=["boletin"])


@router.get("/summaries", response_model=list[BoletinSummaryOut])
def list_summaries(
    category: str | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    session: Session = Depends(get_session),
) -> list[BoletinSummaryOut]:
    conditions = []
    if category is not None:
        conditions.append(BoletinSummary.category == category)

    statement = (
        select(BoletinSummary)
        .where(*conditions)
        .order_by(BoletinSummary.date.desc(), BoletinSummary.norma_id.desc())
        .limit(limit)
        .offset(offset)
    )
    return [
        BoletinSummaryOut(
            norma_id=item.norma_id,
            date=item.date,
            section=item.section,
            title=item.title,
            summary=item.summary.split("\n"),
            category=item.category,
            url=item.url,
        )
        for item in session.scalars(statement).all()
    ]
