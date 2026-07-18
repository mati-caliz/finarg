from __future__ import annotations

from datetime import date
from decimal import Decimal

from labrecha_scraper.base import Connector, IndicatorPoint

SERIES_URL = "https://apis.datos.gob.ar/series/api/series/"

SERIES: dict[str, str] = {
    "444.1_CANASTA_BARIA_0_0_26_47": "cba_nacional",
    "148.3_INIVELNAL_DICI_M_26": "ipc_nivel_general",
}


class SeriesDatosGobConnector(Connector):
    name = "series_datosgob"
    source = "datosgobar"

    def fetch(self) -> list[IndicatorPoint]:
        points: list[IndicatorPoint] = []
        with self.build_client() as client:
            for series_id, indicator_code in SERIES.items():
                points.extend(self._fetch_series(client, series_id, indicator_code))
        return points

    def _fetch_series(self, client, series_id: str, indicator_code: str) -> list[IndicatorPoint]:
        response = client.get(
            SERIES_URL,
            params={"ids": series_id, "limit": 5000, "sort": "asc", "format": "json"},
        )
        response.raise_for_status()
        payload = response.json()
        result: list[IndicatorPoint] = []
        for row in payload.get("data", []):
            if len(row) < 2 or row[0] is None or row[1] is None:
                continue
            result.append(
                IndicatorPoint(
                    indicator_code=indicator_code,
                    source=self.source,
                    date=date.fromisoformat(row[0]),
                    value=Decimal(str(row[1])),
                    meta={"series_id": series_id},
                )
            )
        return result
