from __future__ import annotations

from datetime import date

from sqlalchemy.orm import Session

from labrecha_scraper.base import Connector, upsert_rows
from labrecha_scraper.models import Senator

SENATORS_URL = "https://www.senado.gob.ar/micrositios/DatosAbiertos/ExportarListadoSenadores/json"


def _text(value: object) -> str | None:
    if value is None:
        return None
    stripped = str(value).strip()
    if not stripped or stripped.lower() == "sin datos":
        return None
    return stripped


def _fecha(value: object) -> date | None:
    text = _text(value)
    if text is None:
        return None
    try:
        return date.fromisoformat(text[:10])
    except ValueError:
        return None


class SenadoConnector(Connector):
    name = "senado"
    source = "senado"

    def fetch(self) -> list[dict]:
        with self.build_client() as client:
            response = client.get(SENATORS_URL)
            response.raise_for_status()
            payload = response.json()

        rows: list[dict] = []
        for record in payload.get("table", {}).get("rows", []):
            senator_id = _text(record.get("ID"))
            if senator_id is None:
                continue
            rows.append(
                {
                    "senator_id": senator_id,
                    "last_name": _text(record.get("APELLIDO")),
                    "first_name": _text(record.get("NOMBRE")),
                    "bloc": _text(record.get("BLOQUE")),
                    "province": _text(record.get("PROVINCIA")),
                    "party": _text(record.get("PARTIDO O ALIANZA")),
                    "mandate_start": _fecha(record.get("D_LEGAL")),
                    "mandate_end": _fecha(record.get("C_LEGAL")),
                    "email": _text(record.get("EMAIL")),
                    "photo_url": _text(record.get("FOTO")),
                }
            )
        return rows

    def persist(self, session: Session, data: object) -> int:
        assert isinstance(data, list)
        return upsert_rows(session, Senator, data, ["senator_id"])
