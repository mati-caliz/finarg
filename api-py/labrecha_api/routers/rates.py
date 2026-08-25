from __future__ import annotations

from datetime import date
from decimal import Decimal
from functools import lru_cache
from urllib.error import URLError
from urllib.request import Request, urlopen
import json

from fastapi import APIRouter, HTTPException

from labrecha_api.schemas import RateOut

router = APIRouter(prefix="/rates", tags=["rates"])
BASE_URL = "https://api.argentinadatos.com/v1/finanzas"
HEADERS = {"Accept": "application/json", "User-Agent": "labrecha-api/1.0"}


def _get(path: str) -> tuple[object, int]:
    try:
        with urlopen(Request(f"{BASE_URL}/{path}", headers=HEADERS), timeout=20) as response:
            return json.load(response), int(response.headers.get("Age", "0"))
    except (URLError, TimeoutError, json.JSONDecodeError) as error:
        raise HTTPException(status_code=503, detail="tasas temporalmente no disponibles") from error


def _percent(value: object) -> Decimal:
    return Decimal(str(value)) * 100


@router.get("/wallets", response_model=list[RateOut])
def wallets() -> list[RateOut]:
    payload, _ = _get("rendimientos")
    rows: list[RateOut] = []
    for entity in payload:
        for yield_ in entity.get("rendimientos", []):
            if yield_.get("moneda") != "ARS" or yield_.get("apy") is None:
                continue
            rows.append(RateOut(
                id=f"{entity['entidad']}-ars", name=entity["entidad"].title(),
                tna=Decimal(str(yield_["apy"])), tea=Decimal(str(yield_["apy"])),
                product="Cuenta remunerada en pesos", updated_at=date.fromisoformat(yield_["fecha"]),
                details={key: value for key, value in {"bono": yield_.get("bonusValue"), "tope_bono": yield_.get("bonusThreshold")}.items() if value is not None},
            ))
    return sorted(rows, key=lambda row: row.tna, reverse=True)


@router.get("/fixed-term", response_model=list[RateOut])
def fixed_term() -> list[RateOut]:
    payload, _ = _get("tasas/plazoFijo")
    return sorted([
        RateOut(
            id=item["entidad"], name=item["entidad"].title(), tna=_percent(item["tnaClientes"]),
            product="Plazo fijo online · clientes · referencia 30 días", link=item.get("enlace"),
            details={"tna_no_clientes": float(_percent(item["tnaNoClientes"]))} if item.get("tnaNoClientes") else {},
        ) for item in payload if item.get("tnaClientes")
    ], key=lambda row: row.tna, reverse=True)


@router.get("/uva-mortgages", response_model=list[RateOut])
def uva_mortgages() -> list[RateOut]:
    payload, _ = _get("creditos/hipotecariosUva")
    return sorted([
        RateOut(
            id=item["entidad"], name=item.get("nombreComercial") or item["entidad"],
            tna=_percent(item["tna"]), product="Crédito hipotecario UVA",
            details=item.get("metadata") or {},
        ) for item in payload if item.get("tna") is not None
    ], key=lambda row: row.tna)
