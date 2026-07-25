from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from labrecha_db import GazetteSummary
from sqlalchemy import select
from sqlalchemy.orm import Session

from labrecha_api.db import get_session
from labrecha_api.schemas import GazetteSummaryOut

router = APIRouter(prefix="/gazette", tags=["gazette"])


@router.get("/summaries", response_model=list[GazetteSummaryOut])
def list_summaries(
    category: str | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    session: Session = Depends(get_session),
) -> list[GazetteSummaryOut]:
    conditions = []
    if category is not None:
        conditions.append(GazetteSummary.category == category)

    statement = (
        select(GazetteSummary)
        .where(*conditions)
        .order_by(GazetteSummary.date.desc(), GazetteSummary.regulation_id.desc())
        .limit(limit)
        .offset(offset)
    )
    return [
        GazetteSummaryOut(
            regulation_id=item.regulation_id,
            date=item.date,
            section=item.section,
            title=item.title,
            summary=item.summary.split("\n"),
            category=item.category,
            url=item.url,
        )
        for item in session.scalars(statement).all()
    ]
