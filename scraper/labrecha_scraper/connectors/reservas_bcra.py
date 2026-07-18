from __future__ import annotations

from datetime import date
from decimal import Decimal

from labrecha_scraper.base import Connector, IndicatorPoint

RESERVAS_URL = "https://api.bcra.gob.ar/estadisticas/v4.0/monetarias/1"
PAGE_LIMIT = 1000
BACKFILL_DESDE = "1996-01-01"


class ReservasBcraConnector(Connector):
    name = "reservas_bcra"
    source = "bcra"

    def fetch(self) -> list[IndicatorPoint]:
        points: list[IndicatorPoint] = []
        offset = 0
        with self.build_client() as client:
            while True:
                response = client.get(
                    RESERVAS_URL,
                    params={
                        "desde": BACKFILL_DESDE,
                        "hasta": date.today().isoformat(),
                        "limit": PAGE_LIMIT,
                        "offset": offset,
                    },
                )
                response.raise_for_status()
                payload = response.json()
                results = payload.get("results", [])
                detalle = results[0].get("detalle", []) if results else []
                for item in detalle:
                    fecha = item.get("fecha")
                    valor = item.get("valor")
                    if fecha is None or valor is None:
                        continue
                    points.append(
                        IndicatorPoint(
                            indicator_code="reservas_internacionales",
                            source=self.source,
                            date=date.fromisoformat(fecha),
                            value=Decimal(str(valor)),
                            meta={"unit": "USD_millones", "id_variable": 1},
                        )
                    )
                count = payload.get("metadata", {}).get("resultset", {}).get("count", 0)
                offset += PAGE_LIMIT
                if offset >= count or not detalle:
                    break
        return points
