from __future__ import annotations

import csv
import io
from datetime import date
from decimal import Decimal, InvalidOperation

from sqlalchemy.orm import Session

from labrecha_scraper.base import Connector, upsert_rows
from labrecha_scraper.models import RentByBarrio

CSV_URL = (
    "https://cdn.buenosaires.gob.ar/datosabiertos/datasets/instituto-de-vivienda/"
    "mercado-inmobiliario/precio-alquiler-deptos.csv"
)
ROOMS = "2 ambientes"
MIN_EXPECTED_ROWS = 10

MONTHS = {
    "Ene": 1,
    "Feb": 2,
    "Mar": 3,
    "Abr": 4,
    "May": 5,
    "Jun": 6,
    "Jul": 7,
    "Ago": 8,
    "Sep": 9,
    "Oct": 10,
    "Nov": 11,
    "Dic": 12,
}


def _price(raw: str) -> Decimal | None:
    text = raw.strip()
    if not text:
        return None
    try:
        return Decimal(text.replace(",", "."))
    except InvalidOperation:
        return None


class AlquilerCabaConnector(Connector):
    name = "alquiler_caba"
    source = "caba"

    def fetch(self) -> list[dict]:
        with self.build_client() as client:
            response = client.get(CSV_URL)
            response.raise_for_status()
        return _latest_by_barrio(response.content.decode("utf-8-sig"))

    def persist(self, session: Session, data: object) -> int:
        assert isinstance(data, list)
        return upsert_rows(session, RentByBarrio, data, ["barrio"])


def _latest_by_barrio(csv_text: str) -> list[dict]:
    reader = csv.DictReader(io.StringIO(csv_text), delimiter=";")
    latest: dict[str, tuple[date, dict]] = {}
    for row in reader:
        if row.get("ambientes") != ROOMS:
            continue
        price = _price(row.get("precio_prom", ""))
        if price is None:
            continue
        month = MONTHS.get((row.get("mes") or "").strip())
        year = (row.get("anio") or "").strip()
        barrio = (row.get("barrio") or "").strip()
        if month is None or not year.isdigit() or not barrio:
            continue
        point_date = date(int(year), month, 1)
        current = latest.get(barrio)
        if current is None or point_date > current[0]:
            latest[barrio] = (
                point_date,
                {
                    "barrio": barrio,
                    "comuna": (row.get("comuna") or "").strip() or None,
                    "date": point_date,
                    "price": price,
                    "rooms": ROOMS,
                },
            )
    rows = [entry[1] for entry in latest.values()]
    if len(rows) < MIN_EXPECTED_ROWS:
        raise ValueError("el CSV de alquileres CABA no trajo suficientes barrios (¿cambió el formato?)")
    return rows
