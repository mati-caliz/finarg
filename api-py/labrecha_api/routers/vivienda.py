from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from labrecha_api.db import get_session
from labrecha_api.models import RentByBarrio
from labrecha_api.schemas import RentByBarrioOut

router = APIRouter(prefix="/vivienda", tags=["vivienda"])


@router.get("/rent-by-barrio", response_model=list[RentByBarrioOut])
def rent_by_barrio(session: Session = Depends(get_session)) -> list[RentByBarrioOut]:
    rows = session.scalars(
        select(RentByBarrio).order_by(RentByBarrio.price.desc())
    ).all()
    return [
        RentByBarrioOut(
            barrio=row.barrio,
            comuna=row.comuna,
            date=row.date,
            price=row.price,
            rooms=row.rooms,
        )
        for row in rows
    ]
