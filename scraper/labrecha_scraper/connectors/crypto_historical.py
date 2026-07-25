from __future__ import annotations

import time
from datetime import datetime, timezone
from decimal import Decimal

import httpx

from labrecha_scraper.base import Connector, IndicatorPoint
from labrecha_scraper.connectors.crypto import COINGECKO_IDS, VS_CURRENCY

MARKET_CHART_URL = "https://api.coingecko.com/api/v3/coins/{coingecko_id}/market_chart"
HISTORY_DAYS = 365
SECONDS_BETWEEN_REQUESTS = 20
RATE_LIMIT_RETRIES = 4
RATE_LIMIT_BACKOFF_SECONDS = 65


class CryptoHistoricalConnector(Connector):
    name = "crypto_historical"
    source = "coingecko"

    def fetch(self) -> list[IndicatorPoint]:
        points: list[IndicatorPoint] = []
        with self.build_client() as client:
            for position, (symbol, coingecko_id) in enumerate(COINGECKO_IDS.items()):
                if position > 0:
                    time.sleep(SECONDS_BETWEEN_REQUESTS)
                prices = self._fetch_market_chart(client, coingecko_id)
                points.extend(self._daily_points(symbol, coingecko_id, prices))
        return points

    def _fetch_market_chart(self, client: httpx.Client, coingecko_id: str) -> list[list[float]]:
        for attempt in range(RATE_LIMIT_RETRIES + 1):
            response = client.get(
                MARKET_CHART_URL.format(coingecko_id=coingecko_id),
                params={
                    "vs_currency": VS_CURRENCY,
                    "days": HISTORY_DAYS,
                    "interval": "daily",
                },
            )
            if response.status_code == 429 and attempt < RATE_LIMIT_RETRIES:
                time.sleep(RATE_LIMIT_BACKOFF_SECONDS)
                continue
            response.raise_for_status()
            return response.json().get("prices", [])
        return []

    def _daily_points(
        self, symbol: str, coingecko_id: str, prices: list[list[float]]
    ) -> list[IndicatorPoint]:
        by_date: dict[str, IndicatorPoint] = {}
        for entry in prices:
            if len(entry) < 2 or entry[1] is None:
                continue
            price_date = datetime.fromtimestamp(entry[0] / 1000, tz=timezone.utc).date()
            by_date[price_date.isoformat()] = IndicatorPoint(
                indicator_code=f"crypto_{symbol}",
                source=self.source,
                date=price_date,
                value=Decimal(str(entry[1])),
                meta={"coingecko_id": coingecko_id, "vs_currency": VS_CURRENCY},
            )
        return list(by_date.values())
