from __future__ import annotations

import time
from collections import deque
from ipaddress import ip_address
from threading import Lock

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import JSONResponse

from labrecha_api.config import settings

FORWARDED_FOR = "x-forwarded-for"
SECONDS_PER_WINDOW = 60
EXEMPT_PATHS = frozenset({"/health"})


class SlidingWindowCounter:
    def __init__(self, limit: int, window_seconds: int = SECONDS_PER_WINDOW) -> None:
        self._limit = limit
        self._window = window_seconds
        self._hits: dict[str, deque[float]] = {}
        self._lock = Lock()

    def retry_after(self, key: str, now: float) -> int | None:
        with self._lock:
            hits = self._hits.setdefault(key, deque())
            cutoff = now - self._window
            while hits and hits[0] <= cutoff:
                hits.popleft()
            if len(hits) >= self._limit:
                return max(1, int(hits[0] + self._window - now) + 1)
            hits.append(now)
            if len(self._hits) > settings.rate_limit_max_clients:
                self._evict_idle(cutoff)
            return None

    def _evict_idle(self, cutoff: float) -> None:
        for key, hits in list(self._hits.items()):
            if not hits or hits[-1] <= cutoff:
                del self._hits[key]


def client_key(request: Request) -> str | None:
    forwarded = request.headers.get(FORWARDED_FOR, "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    peer = request.client.host if request.client is not None else ""
    return None if _is_internal(peer) else (peer or "desconocido")


def _is_internal(host: str) -> bool:
    try:
        return ip_address(host).is_private
    except ValueError:
        return False


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: object, limit: int) -> None:
        super().__init__(app)  # type: ignore[arg-type]
        self._counter = SlidingWindowCounter(limit)
        self._limit = limit

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        key = client_key(request)
        if key is None or request.url.path in EXEMPT_PATHS:
            return await call_next(request)

        retry_after = self._counter.retry_after(key, time.monotonic())
        if retry_after is not None:
            return JSONResponse(
                status_code=429,
                content={
                    "detail": (
                        f"Demasiadas consultas: el límite es {self._limit} por minuto. "
                        "Si necesitás más volumen, escribinos."
                    )
                },
                headers={"Retry-After": str(retry_after)},
            )

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(self._limit)
        return response
