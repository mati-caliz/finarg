from __future__ import annotations

from enum import StrEnum


class Unit(StrEnum):
    ARS = "ARS"
    ARS_MILLIONS = "ARS_millones"
    ARS_PER_USD = "ARS_por_USD"
    USD = "USD"
    USD_MILLIONS = "USD_millones"
    PERCENT = "%"
    ANNUAL_NOMINAL_RATE = "TNA_%"
    INDEX = "indice"
    POINTS = "puntos"
    THOUSANDS_OF_PEOPLE = "miles_personas"
    BENEFITS = "prestaciones"
    TAXES = "tributos"
