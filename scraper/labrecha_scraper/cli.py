from __future__ import annotations

import argparse
import logging
import sys

from sqlalchemy import select

from labrecha_scraper.base import run_job
from labrecha_scraper.db import SessionLocal, engine
from labrecha_scraper.models import Base, ScrapeRun
from labrecha_scraper.registry import CONNECTORS, get_connector
from labrecha_scraper.seed_coparticipacion import seed_coparticipacion
from labrecha_scraper.seed_events import seed_events
from labrecha_scraper.seed_taxes import seed_taxes


def _configure_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s - %(message)s",
    )


def _init_db() -> None:
    Base.metadata.create_all(engine)
    tables = ", ".join(sorted(Base.metadata.tables))
    print(f"tablas creadas/verificadas: {tables}")


def _list_jobs() -> None:
    for name in sorted(CONNECTORS):
        print(f"{name:20s} source={CONNECTORS[name].source}")


def _run(job: str) -> int:
    jobs = list(CONNECTORS) if job == "all" else [job]
    failures = 0
    with SessionLocal() as session:
        for name in jobs:
            connector = get_connector(name)
            run = run_job(session, connector)
            print(f"{name:20s} {run.status:8s} filas={run.rows_upserted} {run.error or ''}")
            if run.status != "success":
                failures += 1
    return failures


def _seed_events() -> None:
    with SessionLocal() as session:
        count = seed_events(session)
    print(f"political_events sembrados/actualizados: {count}")


def _seed_taxes() -> None:
    with SessionLocal() as session:
        count = seed_taxes(session)
    print(f"indicadores de tributos (IARAF) sembrados/actualizados: {count}")


def _seed_coparticipacion() -> None:
    with SessionLocal() as session:
        count = seed_coparticipacion(session)
    print(f"coeficientes de coparticipación (CFI) sembrados/actualizados: {count}")


def _status() -> None:
    with SessionLocal() as session:
        for name in sorted(CONNECTORS):
            run = session.scalars(
                select(ScrapeRun)
                .where(ScrapeRun.job_name == name)
                .order_by(ScrapeRun.started_at.desc())
                .limit(1)
            ).first()
            if run is None:
                print(f"{name:20s} sin corridas")
            else:
                print(
                    f"{name:20s} {run.status:8s} filas={run.rows_upserted} "
                    f"inicio={run.started_at:%Y-%m-%d %H:%M} {run.error or ''}"
                )


def main(argv: list[str] | None = None) -> int:
    _configure_logging()
    parser = argparse.ArgumentParser(prog="labrecha-scraper")
    subparsers = parser.add_subparsers(dest="command", required=True)

    subparsers.add_parser("init-db", help="crear tablas si no existen")
    subparsers.add_parser("list", help="listar jobs disponibles")
    subparsers.add_parser("seed-events", help="sembrar hitos políticos curados")
    subparsers.add_parser("seed-taxes", help="sembrar conteo de tributos (IARAF)")
    subparsers.add_parser("seed-coparticipacion", help="sembrar coeficientes Ley 23.548 (CFI)")
    subparsers.add_parser("status", help="última corrida de cada job")
    run_parser = subparsers.add_parser("run", help="correr un job o 'all'")
    run_parser.add_argument("job", help="nombre del job o 'all'")

    args = parser.parse_args(argv)

    if args.command == "init-db":
        _init_db()
        return 0
    if args.command == "list":
        _list_jobs()
        return 0
    if args.command == "seed-events":
        _seed_events()
        return 0
    if args.command == "seed-taxes":
        _seed_taxes()
        return 0
    if args.command == "seed-coparticipacion":
        _seed_coparticipacion()
        return 0
    if args.command == "status":
        _status()
        return 0
    if args.command == "run":
        return _run(args.job)
    return 1


if __name__ == "__main__":
    sys.exit(main())
