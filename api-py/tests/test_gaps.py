from __future__ import annotations

from datetime import date
from decimal import Decimal

from labrecha_api.routers.gaps import Measurement, _build_gap

DAY = date(2026, 7, 1)
CODE = "international_reserves"
UNIT = "USD_millones"


def measurement(source: str, value: int, unit: str | None = UNIT) -> Measurement:
    return Measurement(source=source, value=Decimal(value), unit=unit)


def test_a_single_measurement_is_not_a_gap() -> None:
    assert _build_gap(CODE, DAY, [measurement("bcra", 100)]) is None


def test_no_measurements_is_not_a_gap() -> None:
    assert _build_gap(CODE, DAY, []) is None


def test_the_gap_is_the_spread_over_the_lower_measurement() -> None:
    gap = _build_gap(CODE, DAY, [measurement("bcra", 120), measurement("datosgobar", 100)])

    assert gap is not None
    assert gap.higher_source == "bcra"
    assert gap.higher_value == Decimal(120)
    assert gap.lower_source == "datosgobar"
    assert gap.lower_value == Decimal(100)
    assert gap.spread == Decimal(20)
    assert gap.gap_pct == 20.0
    assert gap.unit == UNIT


def test_the_gap_does_not_depend_on_the_order_of_the_measurements() -> None:
    ascending = _build_gap(CODE, DAY, [measurement("datosgobar", 100), measurement("bcra", 120)])
    descending = _build_gap(CODE, DAY, [measurement("bcra", 120), measurement("datosgobar", 100)])

    assert ascending is not None
    assert descending is not None
    assert ascending.model_dump() == descending.model_dump()


def test_measurements_are_reported_from_the_highest_to_the_lowest() -> None:
    gap = _build_gap(
        CODE,
        DAY,
        [measurement("media", 110), measurement("baja", 100), measurement("alta", 120)],
    )

    assert gap is not None
    assert [item.source for item in gap.measurements] == ["alta", "media", "baja"]


def test_more_than_two_sources_compare_the_extremes() -> None:
    gap = _build_gap(
        CODE,
        DAY,
        [measurement("media", 110), measurement("baja", 100), measurement("alta", 120)],
    )

    assert gap is not None
    assert gap.higher_source == "alta"
    assert gap.lower_source == "baja"
    assert gap.spread == Decimal(20)


def test_identical_measurements_have_no_gap() -> None:
    gap = _build_gap(CODE, DAY, [measurement("bcra", 100), measurement("datosgobar", 100)])

    assert gap is not None
    assert gap.spread == Decimal(0)
    assert gap.gap_pct == 0.0


def test_a_zero_baseline_does_not_blow_up() -> None:
    gap = _build_gap(CODE, DAY, [measurement("bcra", 50), measurement("datosgobar", 0)])

    assert gap is not None
    assert gap.spread == Decimal(50)
    assert gap.gap_pct == 0.0


def test_the_baseline_is_the_absolute_value_of_the_lower_measurement() -> None:
    gap = _build_gap(CODE, DAY, [measurement("bcra", 50), measurement("datosgobar", -50)])

    assert gap is not None
    assert gap.spread == Decimal(100)
    assert gap.gap_pct == 200.0


def test_the_gap_keeps_the_indicator_and_the_date_it_was_measured() -> None:
    gap = _build_gap(CODE, DAY, [measurement("bcra", 120), measurement("datosgobar", 100)])

    assert gap is not None
    assert gap.indicator_code == CODE
    assert gap.date == DAY


def test_measurements_in_different_units_are_not_a_gap() -> None:
    gap = _build_gap(
        CODE,
        DAY,
        [measurement("bcra", 40_000), measurement("datosgobar", 40, unit="USD_billones")],
    )

    assert gap is None


def test_a_source_in_another_unit_is_excluded_and_auditable() -> None:
    gap = _build_gap(
        CODE,
        DAY,
        [
            measurement("bcra", 120),
            measurement("datosgobar", 100),
            measurement("consultora", 40, unit="USD_billones"),
        ],
    )

    assert gap is not None
    assert [item.source for item in gap.measurements] == ["bcra", "datosgobar"]
    assert [item.source for item in gap.excluded_sources] == ["consultora"]
    assert "USD_billones" in gap.excluded_sources[0].reason


def test_a_source_without_a_declared_unit_is_excluded() -> None:
    gap = _build_gap(
        CODE,
        DAY,
        [
            measurement("bcra", 120),
            measurement("datosgobar", 100),
            measurement("consultora", 999, unit=None),
        ],
    )

    assert gap is not None
    assert gap.higher_source == "bcra"
    assert [item.source for item in gap.excluded_sources] == ["consultora"]


def test_two_sources_without_unit_are_not_compared() -> None:
    gap = _build_gap(
        CODE,
        DAY,
        [measurement("bcra", 120, unit=None), measurement("datosgobar", 100, unit=None)],
    )

    assert gap is None


def test_the_compared_unit_is_the_one_with_most_sources() -> None:
    gap = _build_gap(
        CODE,
        DAY,
        [
            measurement("bcra", 40_000, unit="USD_billones"),
            measurement("datosgobar", 100),
            measurement("consultora", 120),
            measurement("otra", 130),
        ],
    )

    assert gap is not None
    assert gap.unit == UNIT
    assert [item.source for item in gap.measurements] == ["otra", "consultora", "datosgobar"]
    assert [item.source for item in gap.excluded_sources] == ["bcra"]
