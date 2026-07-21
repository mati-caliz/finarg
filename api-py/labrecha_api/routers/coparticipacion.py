from __future__ import annotations

from decimal import ROUND_HALF_UP, Decimal

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from labrecha_api.db import get_session
from labrecha_api.models import CoparticipacionShare
from labrecha_api.schemas import CoparticipacionShareOut

router = APIRouter(prefix="/coparticipacion", tags=["coparticipacion"])

ONE_HUNDRED = Decimal(100)
SHARE_PRECISION = Decimal("0.01")


@router.get("", response_model=list[CoparticipacionShareOut])
def list_shares(session: Session = Depends(get_session)) -> list[CoparticipacionShareOut]:
    rows = session.scalars(
        select(CoparticipacionShare).order_by(CoparticipacionShare.coefficient.desc())
    ).all()
    total = sum((row.coefficient for row in rows), Decimal(0))
    return [
        CoparticipacionShareOut(
            province=row.province,
            coefficient=row.coefficient,
            share_pct=(
                (row.coefficient / total * ONE_HUNDRED).quantize(
                    SHARE_PRECISION, rounding=ROUND_HALF_UP
                )
                if total > 0
                else Decimal(0)
            ),
        )
        for row in rows
    ]
