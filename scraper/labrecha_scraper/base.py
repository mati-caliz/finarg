from __future__ import annotations

import logging
from abc import ABC, abstractmethod
from datetime import date
from decimal import Decimal

import httpx
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from labrecha_scraper.config import settings
from labrecha_scraper.models import IndicatorHistory, ScrapeRun

logger = logging.getLogger("labrecha_scraper")


class IndicatorPoint(BaseModel):
    indicator_code: str
    source: str
    date: date
    value: Decimal
    meta: dict = {}


class Connector(ABC):
    name: str
    source: str

    def build_client(self) -> httpx.Client:
        return httpx.Client(
            timeout=settings.http_timeout_seconds,
            headers={"User-Agent": settings.http_user_agent},
            follow_redirects=True,
        )

    @abstractmethod
    def fetch(self) -> list[IndicatorPoint]:
        raise NotImplementedError


def _upsert(session: Session, points: list[IndicatorPoint]) -> int:
    if not points:
        return 0
    rows = [
        {
            "indicator_code": point.indicator_code,
            "source": point.source,
            "date": point.date,
            "value": point.value,
            "meta": point.meta,
        }
        for point in points
    ]
    statement = insert(IndicatorHistory).values(rows)
    statement = statement.on_conflict_do_update(
        constraint="uq_indicator_source_date",
        set_={"value": statement.excluded.value, "meta": statement.excluded.meta},
    )
    session.execute(statement)
    return len(rows)


def run_job(session: Session, connector: Connector) -> ScrapeRun:
    run = ScrapeRun(job_name=connector.name, status="running")
    session.add(run)
    session.commit()

    try:
        points = connector.fetch()
        upserted = _upsert(session, points)
        run.rows_upserted = upserted
        run.status = "success"
        run.finished_at = func.now()
        session.commit()
        logger.info("job %s: %s filas upserted", connector.name, upserted)
    except Exception as error:
        session.rollback()
        run.status = "error"
        run.error = f"{type(error).__name__}: {error}"[:4000]
        run.finished_at = func.now()
        session.add(run)
        session.commit()
        logger.error("job %s falló: %s", connector.name, run.error)

    session.refresh(run)
    return run


def latest_run(session: Session, job_name: str) -> ScrapeRun | None:
    return session.scalars(
        select(ScrapeRun)
        .where(ScrapeRun.job_name == job_name)
        .order_by(ScrapeRun.started_at.desc())
        .limit(1)
    ).first()
