from __future__ import annotations

from datetime import date, datetime
from zoneinfo import ZoneInfo

ARGENTINA_TIMEZONE = ZoneInfo("America/Argentina/Buenos_Aires")


def today_in_argentina() -> date:
    return datetime.now(ARGENTINA_TIMEZONE).date()
