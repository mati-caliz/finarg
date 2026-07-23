from __future__ import annotations

from datetime import date
from decimal import Decimal

from sqlalchemy.orm import Session

from labrecha_scraper.base import Connector, IndicatorPoint, upsert_rows
from labrecha_scraper.models import IndicatorHistory

DOLARES_HISTORICOS_URL = "https://api.argentinadatos.com/v1/cotizaciones/dolares"


class DolarHistoricoConnector(Connector):
    name = "dolar_historico"
    source = "argentinadatos"

    def fetch(self) -> list[IndicatorPoint]:
        with self.build_client() as client:
            response = client.get(DOLARES_HISTORICOS_URL)
            response.raise_for_status()
            payload = response.json()

        points_by_key: dict[tuple[str, date], IndicatorPoint] = {}
        for item in payload:
            casa = item.get("casa")
            venta = item.get("venta")
            fecha = item.get("fecha")
            if casa is None or venta is None or fecha is None:
                continue
            indicator_code = f"dolar_{casa}"
            point_date = date.fromisoformat(fecha)
            points_by_key[(indicator_code, point_date)] = IndicatorPoint(
                indicator_code=indicator_code,
                source=self.source,
                date=point_date,
                value=Decimal(str(venta)),
                meta={"compra": item.get("compra"), "venta": venta},
            )
        return list(points_by_key.values())

    def persist(self, session: Session, data: object) -> int:
        points: list[IndicatorPoint] = data
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
        return upsert_rows(
            session,
            IndicatorHistory,
            rows,
            index_elements=["indicator_code", "source", "date"],
        )
