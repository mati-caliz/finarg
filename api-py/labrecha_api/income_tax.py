from __future__ import annotations

from dataclasses import dataclass
from decimal import ROUND_HALF_UP, Decimal

from labrecha_api.schemas import (
    IncomeTaxCalculationDetails,
    IncomeTaxDeductionBreakdown,
    IncomeTaxRequest,
    IncomeTaxResponse,
    TaxBracketOut,
)

SALARY_PAYMENTS_PER_YEAR = Decimal(13)
MONTHS_PER_YEAR = Decimal(12)
HEALTH_INSURANCE_RATE = Decimal("0.03")
RETIREMENT_RATE = Decimal("0.11")
MAX_DEDUCTION_RATE = Decimal("0.40")
PERCENTAGE_DIVISOR = Decimal(100)
MAX_TAXABLE_INCOME = Decimal("999999999999")

ANNUAL_MINIMUM_EXEMPTION = Decimal("4211886.94")
SPECIAL_DEDUCTION_4TH = Decimal("20217057.35")
SPOUSE_ALLOWANCE = Decimal("3966752.72")
CHILD_ALLOWANCE = Decimal("2000447.87")
CHILD_DISABILITY_ALLOWANCE = Decimal("4000895.74")
LIFE_INSURANCE_ANNUAL_CAP = Decimal("573817.13")

MONEY = Decimal("0.01")


@dataclass(frozen=True)
class TaxBracketScale:
    from_amount: Decimal
    to_amount: Decimal
    rate: Decimal


SCALES: list[TaxBracketScale] = [
    TaxBracketScale(Decimal(0), Decimal("1749901.45"), Decimal(5)),
    TaxBracketScale(Decimal("1749901.45"), Decimal("3499802.89"), Decimal(9)),
    TaxBracketScale(Decimal("3499802.89"), Decimal("5249704.34"), Decimal(12)),
    TaxBracketScale(Decimal("5249704.34"), Decimal("7874556.52"), Decimal(15)),
    TaxBracketScale(Decimal("7874556.52"), Decimal("15749113.04"), Decimal(19)),
    TaxBracketScale(Decimal("15749113.04"), Decimal("23623669.56"), Decimal(23)),
    TaxBracketScale(Decimal("23623669.56"), Decimal("35435504.34"), Decimal(27)),
    TaxBracketScale(Decimal("35435504.34"), Decimal("53153256.52"), Decimal(31)),
    TaxBracketScale(Decimal("53153256.52"), MAX_TAXABLE_INCOME, Decimal(35)),
]


@dataclass(frozen=True)
class _LegalDeductions:
    retirement: Decimal
    health_insurance: Decimal
    law_19032: Decimal
    union_dues: Decimal
    total: Decimal


def _money(value: Decimal) -> Decimal:
    return value.quantize(MONEY, rounding=ROUND_HALF_UP)


def _retirement(request: IncomeTaxRequest, gross_annual: Decimal) -> Decimal:
    if request.retirement is not None:
        return request.retirement * MONTHS_PER_YEAR
    return gross_annual * RETIREMENT_RATE


def _health_insurance(request: IncomeTaxRequest, gross_annual: Decimal) -> Decimal:
    if request.health_insurance is not None:
        return request.health_insurance * MONTHS_PER_YEAR
    return gross_annual * HEALTH_INSURANCE_RATE


def _union_dues(request: IncomeTaxRequest, gross_annual: Decimal) -> Decimal:
    if request.union_dues_percent is not None and request.union_dues_percent > 0:
        return _money(gross_annual * request.union_dues_percent / PERCENTAGE_DIVISOR)
    if request.union_dues is not None:
        return request.union_dues * MONTHS_PER_YEAR
    return Decimal(0)


def _legal_deductions(request: IncomeTaxRequest, gross_annual: Decimal) -> _LegalDeductions:
    retirement = Decimal(0) if request.retired else _retirement(request, gross_annual)
    health_insurance = Decimal(0) if request.retired else _health_insurance(request, gross_annual)
    law_19032 = Decimal(0) if request.retired else gross_annual * HEALTH_INSURANCE_RATE
    union_dues = _union_dues(request, gross_annual)
    total = retirement + health_insurance + law_19032 + union_dues
    return _LegalDeductions(retirement, health_insurance, law_19032, union_dues, total)


def _family_allowances(request: IncomeTaxRequest) -> Decimal:
    allowances = Decimal(0)
    if request.has_spouse:
        allowances += SPOUSE_ALLOWANCE
    disabled = min(max(0, request.children_with_disabilities_count), request.number_of_children)
    regular = max(0, request.number_of_children - disabled)
    allowances += CHILD_ALLOWANCE * regular
    allowances += CHILD_DISABILITY_ALLOWANCE * disabled
    return allowances


def _personal_deductions(request: IncomeTaxRequest, gross_annual: Decimal) -> Decimal:
    deductions = Decimal(0)
    max_by_rate = gross_annual * MAX_DEDUCTION_RATE
    if request.housing_rent is not None:
        deductions += min(request.housing_rent * MONTHS_PER_YEAR, max_by_rate)
    if request.domestic_service is not None:
        deductions += min(request.domestic_service * MONTHS_PER_YEAR, ANNUAL_MINIMUM_EXEMPTION)
    if request.education_expenses is not None:
        deductions += min(request.education_expenses * MONTHS_PER_YEAR, max_by_rate)
    if request.life_insurance is not None and request.life_insurance > 0:
        deductions += min(request.life_insurance * MONTHS_PER_YEAR, LIFE_INSURANCE_ANNUAL_CAP)
    return deductions


def _tax_by_brackets(taxable_income: Decimal) -> tuple[Decimal, list[TaxBracketOut]]:
    breakdown: list[TaxBracketOut] = []
    total_tax = Decimal(0)
    remaining = taxable_income
    bracket_number = 1
    for scale in SCALES:
        if remaining <= 0:
            break
        bracket_range = scale.to_amount - scale.from_amount
        bracket_base = min(remaining, bracket_range)
        bracket_tax = _money(bracket_base * scale.rate / PERCENTAGE_DIVISOR)
        if bracket_base > 0:
            breakdown.append(
                TaxBracketOut(
                    bracket=bracket_number,
                    from_amount=scale.from_amount,
                    to_amount=scale.to_amount,
                    rate=scale.rate,
                    taxable_base=bracket_base,
                    bracket_tax=bracket_tax,
                )
            )
            bracket_number += 1
        total_tax += bracket_tax
        remaining -= bracket_range
    return total_tax, breakdown


def calculate_income_tax(request: IncomeTaxRequest) -> IncomeTaxResponse:
    gross_annual = request.gross_monthly_salary * SALARY_PAYMENTS_PER_YEAR

    legal = _legal_deductions(request, gross_annual)
    family_allowances = _family_allowances(request)
    personal_deductions = _personal_deductions(request, gross_annual)

    legal_net_income = gross_annual - legal.total
    total_allowed_deductions = (
        ANNUAL_MINIMUM_EXEMPTION + SPECIAL_DEDUCTION_4TH + family_allowances + personal_deductions
    )
    taxable_income = max(Decimal(0), legal_net_income - total_allowed_deductions)

    total_tax, breakdown = _tax_by_brackets(taxable_income)

    monthly_tax = _money(total_tax / MONTHS_PER_YEAR)
    monthly_legal = _money(legal.total / MONTHS_PER_YEAR)
    net_monthly = request.gross_monthly_salary - monthly_legal - monthly_tax
    effective_rate = (
        (total_tax / gross_annual).quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP)
        * PERCENTAGE_DIVISOR
        if gross_annual > 0
        else Decimal(0)
    )

    return IncomeTaxResponse(
        gross_monthly_salary=_money(request.gross_monthly_salary),
        gross_annual_salary=_money(gross_annual),
        monthly_legal_deductions=monthly_legal,
        total_deductions=_money(legal.total + total_allowed_deductions),
        taxable_income=_money(taxable_income),
        annual_tax=_money(total_tax),
        monthly_tax=monthly_tax,
        effective_rate=_money(effective_rate),
        net_monthly_salary=_money(net_monthly),
        calculation_details=IncomeTaxCalculationDetails(
            minimum_exemption=ANNUAL_MINIMUM_EXEMPTION,
            special_deduction=SPECIAL_DEDUCTION_4TH,
            family_allowances=family_allowances,
            personal_deductions=personal_deductions,
            total_allowed_deductions=total_allowed_deductions,
        ),
        deduction_breakdown=IncomeTaxDeductionBreakdown(
            retirement=_money(legal.retirement / MONTHS_PER_YEAR),
            health_insurance=_money(legal.health_insurance / MONTHS_PER_YEAR),
            law_19032=_money(legal.law_19032 / MONTHS_PER_YEAR),
            union_dues=_money(legal.union_dues / MONTHS_PER_YEAR),
            income_tax=monthly_tax,
            total=_money(monthly_legal + monthly_tax),
        ),
        tax_brackets=breakdown,
    )
