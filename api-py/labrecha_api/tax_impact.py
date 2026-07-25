from __future__ import annotations

from datetime import date, timedelta
from decimal import ROUND_HALF_UP, Decimal

from labrecha_api.clock import today_in_argentina
from labrecha_api.income_tax import (
    MONTHS_PER_YEAR,
    PERCENTAGE_DIVISOR,
    SALARY_PAYMENTS_PER_YEAR,
    calculate_income_tax,
)
from labrecha_api.schemas import (
    IncomeTaxRequest,
    TaxImpactItem,
    TaxImpactRequest,
    TaxImpactResponse,
)

MONEY = Decimal("0.01")
SHARE_PRECISION = Decimal("0.01")
VAT_RATE = Decimal(21)
VAT_BASE = PERCENTAGE_DIVISOR + VAT_RATE
DAYS_IN_YEAR = Decimal(365)

CATEGORY_TAX = "impuesto"
CATEGORY_SOCIAL_SECURITY = "aporte"


def _money(value: Decimal) -> Decimal:
    return value.quantize(MONEY, rounding=ROUND_HALF_UP)


def _share(annual_amount: Decimal, gross_annual_income: Decimal) -> Decimal:
    if gross_annual_income <= 0:
        return Decimal(0)
    return (annual_amount / gross_annual_income * PERCENTAGE_DIVISOR).quantize(
        SHARE_PRECISION, rounding=ROUND_HALF_UP
    )


def _item(
    concept: str, category: str, annual_amount: Decimal, gross_annual_income: Decimal
) -> TaxImpactItem:
    return TaxImpactItem(
        concept=concept,
        category=category,
        annual_amount=_money(annual_amount),
        monthly_amount=_money(annual_amount / MONTHS_PER_YEAR),
        share_of_income=_share(annual_amount, gross_annual_income),
    )


def calculate_tax_impact(request: TaxImpactRequest) -> TaxImpactResponse:
    income = calculate_income_tax(
        IncomeTaxRequest(gross_monthly_salary=request.gross_monthly_salary, retired=request.retired)
    )

    gross_annual_income = request.gross_monthly_salary * SALARY_PAYMENTS_PER_YEAR
    annual_expenses = request.monthly_expenses * MONTHS_PER_YEAR

    income_tax_annual = income.annual_tax
    social_security_annual = income.monthly_legal_deductions * MONTHS_PER_YEAR

    vat_annual = annual_expenses * VAT_RATE / VAT_BASE
    net_of_vat = annual_expenses * PERCENTAGE_DIVISOR / VAT_BASE
    gross_receipts_annual = net_of_vat * request.iibb_rate / PERCENTAGE_DIVISOR

    items = [
        _item("Impuesto a las Ganancias", CATEGORY_TAX, income_tax_annual, gross_annual_income),
        _item("IVA en tus gastos", CATEGORY_TAX, vat_annual, gross_annual_income),
        _item(
            "Ingresos Brutos en tus gastos",
            CATEGORY_TAX,
            gross_receipts_annual,
            gross_annual_income,
        ),
        _item(
            "Aportes (jubilación, obra social, PAMI, sindicato)",
            CATEGORY_SOCIAL_SECURITY,
            social_security_annual,
            gross_annual_income,
        ),
    ]

    total_annual = income_tax_annual + vat_annual + gross_receipts_annual + social_security_annual
    total_pressure = _share(total_annual, gross_annual_income)

    fraction = total_annual / gross_annual_income if gross_annual_income > 0 else Decimal(0)
    days_for_the_state = int(
        min(DAYS_IN_YEAR, (fraction * DAYS_IN_YEAR).to_integral_value(ROUND_HALF_UP))
    )
    tax_freedom_date = date(today_in_argentina().year, 1, 1) + timedelta(days=days_for_the_state)

    return TaxImpactResponse(
        gross_annual_income=_money(gross_annual_income),
        annual_expenses=_money(annual_expenses),
        total_annual=_money(total_annual),
        total_monthly=_money(total_annual / MONTHS_PER_YEAR),
        total_pressure=total_pressure,
        days_for_the_state=days_for_the_state,
        tax_freedom_date=tax_freedom_date,
        items=items,
    )
