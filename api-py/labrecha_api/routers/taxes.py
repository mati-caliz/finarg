from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from labrecha_api.db import get_session
from labrecha_api.models import TaxChange
from labrecha_api.schemas import TaxChangeOut

router = APIRouter(prefix="/taxes", tags=["taxes"])


@router.get("/changes", response_model=list[TaxChangeOut])
def list_changes(
    change_type: str | None = Query(default=None),
    jurisdiction: str | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    session: Session = Depends(get_session),
) -> list[TaxChangeOut]:
    conditions = []
    if change_type is not None:
        conditions.append(TaxChange.change_type == change_type)
    if jurisdiction is not None:
        conditions.append(TaxChange.jurisdiction == jurisdiction)

    statement = (
        select(TaxChange)
        .where(*conditions)
        .order_by(TaxChange.date.desc(), TaxChange.regulation_id.desc())
        .limit(limit)
        .offset(offset)
    )
    return [
        TaxChangeOut(
            regulation_id=item.regulation_id,
            date=item.date,
            change_type=item.change_type,
            tax_name=item.tax_name,
            jurisdiction=item.jurisdiction,
            title=item.title,
            url=item.url,
        )
        for item in session.scalars(statement).all()
    ]
