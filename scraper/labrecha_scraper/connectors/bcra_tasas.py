from __future__ import annotations

from datetime import date
from decimal import Decimal

from labrecha_scraper.base import Connector, IndicatorPoint

BASE_URL = "https://api.bcra.gob.ar/estadisticas/v4.0/monetarias"
PAGE_LIMIT = 1000
BACKFILL_DESDE = "2004-01-01"

VARIABLES = {
    12: "tasa_plazo_fijo",
    44: "tasa_tamar",
}


class BcraTasasConnector(Connector):
    name = "bcra_tasas"
    source = "bcra"

    def fetch(self) -> list[IndicatorPoint]:
        points: list[IndicatorPoint] = []
        with self.build_client() as client:
            for id_variable, indicator_code in VARIABLES.items():
                points.extend(self._fetch_variable(client, id_variable, indicator_code))
        return points

    def _fetch_variable(self, client, id_variable: int, indicator_code: str) -> list[IndicatorPoint]:
        result: list[IndicatorPoint] = []
        offset = 0
        while True:
            response = client.get(
                f"{BASE_URL}/{id_variable}",
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
                result.append(
                    IndicatorPoint(
                        indicator_code=indicator_code,
                        source=self.source,
                        date=date.fromisoformat(fecha),
                        value=Decimal(str(valor)),
                        meta={"unit": "TNA_%", "id_variable": id_variable},
                    )
                )
            count = payload.get("metadata", {}).get("resultset", {}).get("count", 0)
            offset += PAGE_LIMIT
            if offset >= count or not detalle:
                break
        return result
