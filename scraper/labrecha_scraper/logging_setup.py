from __future__ import annotations

import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path

from labrecha_scraper.config import settings

LOG_FORMAT = "%(asctime)s %(levelname)s %(name)s - %(message)s"
RUN_LOG_FILENAME = "scraper.log"
FAILURE_LOG_FILENAME = "scraper-errors.log"


class _FailuresOnly(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        return record.levelno >= logging.ERROR


def _rotating_handler(directory: Path, filename: str, level: int) -> RotatingFileHandler:
    handler = RotatingFileHandler(
        directory / filename,
        maxBytes=settings.log_max_bytes,
        backupCount=settings.log_backup_count,
        encoding="utf-8",
    )
    handler.setLevel(level)
    handler.setFormatter(logging.Formatter(LOG_FORMAT))
    return handler


def configure_logging() -> None:
    logging.basicConfig(level=logging.INFO, format=LOG_FORMAT)
    if not settings.log_dir:
        return

    directory = Path(settings.log_dir)
    directory.mkdir(parents=True, exist_ok=True)

    root = logging.getLogger()
    root.addHandler(_rotating_handler(directory, RUN_LOG_FILENAME, logging.INFO))

    failures = _rotating_handler(directory, FAILURE_LOG_FILENAME, logging.ERROR)
    failures.addFilter(_FailuresOnly())
    root.addHandler(failures)
