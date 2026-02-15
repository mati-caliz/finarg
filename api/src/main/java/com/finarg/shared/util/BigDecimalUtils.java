package com.finarg.shared.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class BigDecimalUtils {

    public static final BigDecimal ONE_HUNDRED = new BigDecimal("100");
    public static final int MONTHS_PER_YEAR = 12;
    public static final int DAYS_PER_YEAR = 365;

    private BigDecimalUtils() { }

    public static BigDecimal orZero(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    public static BigDecimal orDefault(BigDecimal value, BigDecimal defaultValue) {
        return value != null ? value : defaultValue;
    }

    public static BigDecimal fromLong(Long value) {
        return value != null ? new BigDecimal(value) : BigDecimal.ZERO;
    }

    public static BigDecimal percentageChange(BigDecimal base, BigDecimal percent) {
        if (base == null || percent == null) {
            return BigDecimal.ZERO;
        }
        return base.multiply(percent).divide(ONE_HUNDRED, 2, RoundingMode.HALF_UP);
    }

    public static BigDecimal variationPercentage(BigDecimal current, BigDecimal previous) {
        if (current == null || previous == null || previous.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return current.subtract(previous)
                .divide(previous, 4, RoundingMode.HALF_UP)
                .multiply(ONE_HUNDRED);
    }

    public static BigDecimal inflationFactor(BigDecimal monthlyRate) {
        return BigDecimal.ONE.add(monthlyRate.divide(ONE_HUNDRED, 6, RoundingMode.HALF_UP));
    }

    public static BigDecimal teaFromTna(BigDecimal tna) {
        return BigDecimal.ONE.add(tna.divide(BigDecimal.valueOf(MONTHS_PER_YEAR), 10, RoundingMode.HALF_UP))
                .pow(MONTHS_PER_YEAR)
                .subtract(BigDecimal.ONE);
    }
}
