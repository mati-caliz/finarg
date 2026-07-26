from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from labrecha_db import ErrorEvent
from sqlalchemy import select
from sqlalchemy.orm import Session

from labrecha_api.admin_auth import is_admin
from labrecha_api.db import get_session
from labrecha_api.error_events import record_error
from labrecha_api.schemas import ErrorEventOut, ErrorReportIn

router = APIRouter(prefix="/errors", tags=["errors"])

DEFAULT_LIMIT = 20
MAX_LIMIT = 100


def _to_out(event: ErrorEvent, *, include_stack: bool) -> ErrorEventOut:
    return ErrorEventOut(
        fingerprint=event.fingerprint,
        origin=event.origin,
        kind=event.kind,
        message=event.message,
        stack=event.stack if include_stack else None,
        path=event.path,
        occurrences=event.occurrences,
        first_seen_at=event.first_seen_at,
        last_seen_at=event.last_seen_at,
    )


@router.post("", response_model=ErrorEventOut, status_code=201)
def report_error(payload: ErrorReportIn, session: Session = Depends(get_session)) -> ErrorEventOut:
    fingerprint = record_error(
        session,
        origin=payload.origin.value,
        kind=payload.kind,
        message=payload.message,
        stack=payload.stack,
        path=payload.path,
    )
    event = session.scalars(select(ErrorEvent).where(ErrorEvent.fingerprint == fingerprint)).one()
    return _to_out(event, include_stack=False)


@router.get("", response_model=list[ErrorEventOut])
def list_errors(
    limit: int = Query(default=DEFAULT_LIMIT, ge=1, le=MAX_LIMIT),
    *,
    admin: bool = Depends(is_admin),
    session: Session = Depends(get_session),
) -> list[ErrorEventOut]:
    statement = select(ErrorEvent).order_by(ErrorEvent.last_seen_at.desc()).limit(limit)
    return [_to_out(event, include_stack=admin) for event in session.scalars(statement)]
