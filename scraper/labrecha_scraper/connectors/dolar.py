from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal

from labrecha_scraper.base import Connector, IndicatorPoint

DOLAR_URL = "https://dolarapi.com/v1/dolares"


def _parse_date(raw: str | None) -> date:
    if raw is None:
        raise ValueError("fechaActualizacion ausente")
    return datetime.fromisoformat(raw.replace("Z", "+00:00")).date()


class DolarConnector(Connector):
    name = "dolar"
    source = "dolarapi"

    def fetch(self) -> list[IndicatorPoint]:
        with self.build_client() as client:
            response = client.get(DOLAR_URL)
            response.raise_for_status()
            payload = response.json()

        points: list[IndicatorPoint] = []
        for item in payload:
            casa = item.get("casa")
            venta = item.get("venta")
            if casa is None or venta is None:
                continue
            points.append(
                IndicatorPoint(
                    indicator_code=f"dolar_{casa}",
                    source=self.source,
                    date=_parse_date(item.get("fechaActualizacion")),
                    value=Decimal(str(venta)),
                    meta={
                        "nombre": item.get("nombre"),
                        "compra": item.get("compra"),
                        "venta": venta,
                    },
                )
            )
        return points
