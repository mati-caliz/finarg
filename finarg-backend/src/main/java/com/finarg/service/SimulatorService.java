package com.finarg.service;

import com.finarg.model.dto.InflationDTO;
import com.finarg.model.dto.QuoteDTO;
import com.finarg.model.dto.RateDTO;
import com.finarg.model.dto.SimulationRequestDTO;
import com.finarg.model.dto.SimulationResponseDTO;
import com.finarg.model.enums.Country;
import com.finarg.model.enums.CurrencyType;
import com.finarg.model.enums.InvestmentType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SimulatorService {

    private final QuoteService quoteService;
    private final InflationService inflationService;
    private final RatesService ratesService;

    private static final BigDecimal DEFAULT_FIXED_TERM_RATE = new BigDecimal("35");
    private static final BigDecimal MONEY_MARKET_RATE = new BigDecimal("32");
    private static final BigDecimal REPO_RATE = new BigDecimal("30");
    private static final BigDecimal STABLECOIN_RATE = new BigDecimal("5");
    private static final BigDecimal DEFAULT_MONTHLY_INFLATION = new BigDecimal("2");

    public SimulationResponseDTO simulate(SimulationRequestDTO request) {
        log.info("Simulating return: {} - {} - {} days", 
                request.getInvestmentType(), request.getInitialAmount(), request.getTermDays());

        BigDecimal nominalAnnualRate = getRate(request.getInvestmentType(), request.getCustomRate());
        BigDecimal effectiveAnnualRate = calculateEffectiveAnnualRate(nominalAnnualRate);

        BigDecimal nominalReturn = calculateReturn(
                request.getInitialAmount(), 
                nominalAnnualRate, 
                request.getTermDays()
        );

        BigDecimal finalAmount = request.getInitialAmount().add(nominalReturn);

        BigDecimal dollarRate = new BigDecimal("1000");
        try {
            QuoteDTO blueQuote = quoteService.getQuote(Country.ARGENTINA, CurrencyType.AR_BLUE);
            if (blueQuote != null && blueQuote.getSell() != null && blueQuote.getSell().compareTo(BigDecimal.ZERO) > 0) {
                dollarRate = blueQuote.getSell();
            }
        } catch (Exception e) {
            log.warn("Could not get dollar quote for simulation, using default: {}", e.getMessage());
        }

        BigDecimal initialAmountUSD = request.getInitialAmount()
                .divide(dollarRate, 2, RoundingMode.HALF_UP);
        BigDecimal finalAmountUSD = finalAmount.divide(dollarRate, 2, RoundingMode.HALF_UP);
        BigDecimal profitUSD = finalAmountUSD.subtract(initialAmountUSD);

        BigDecimal estimatedInflation = estimateInflation(request.getTermDays());
        BigDecimal realReturn = nominalAnnualRate.subtract(estimatedInflation);

        List<SimulationResponseDTO.MonthlyProjection> projection = generateProjection(
                request.getInitialAmount(),
                nominalAnnualRate,
                request.getTermDays(),
                request.isReinvest()
        );

        return SimulationResponseDTO.builder()
                .investmentType(request.getInvestmentType())
                .initialAmount(request.getInitialAmount())
                .termDays(request.getTermDays())
                .nominalAnnualRate(nominalAnnualRate.setScale(2, RoundingMode.HALF_UP))
                .effectiveAnnualRate(effectiveAnnualRate.setScale(2, RoundingMode.HALF_UP))
                .nominalReturn(nominalReturn.setScale(2, RoundingMode.HALF_UP))
                .realReturn(realReturn.setScale(2, RoundingMode.HALF_UP))
                .finalAmount(finalAmount.setScale(2, RoundingMode.HALF_UP))
                .profitARS(nominalReturn.setScale(2, RoundingMode.HALF_UP))
                .profitUSD(profitUSD.setScale(2, RoundingMode.HALF_UP))
                .dollarReturn(profitUSD.divide(initialAmountUSD, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP))
                .projection(projection)
                .build();
    }

    private BigDecimal getRate(InvestmentType type, BigDecimal customRate) {
        if (customRate != null && customRate.compareTo(BigDecimal.ZERO) > 0) {
            return customRate;
        }

        return switch (type) {
            case FIXED_TERM -> getRealFixedTermRate();
            case FIXED_TERM_UVA -> getUVARate();
            case MONEY_MARKET_FUND -> MONEY_MARKET_RATE;
            case FIXED_INCOME_FUND -> MONEY_MARKET_RATE.subtract(new BigDecimal("2"));
            case REPO -> REPO_RATE;
            case STABLECOIN_DAI, STABLECOIN_USDT -> STABLECOIN_RATE;
        };
    }

    private BigDecimal getRealFixedTermRate() {
        try {
            List<RateDTO> rates = ratesService.getFixedTermRates(Country.ARGENTINA);
            if (rates != null && !rates.isEmpty() && rates.get(0).getTna() != null
                    && rates.get(0).getTna().compareTo(BigDecimal.ZERO) > 0) {
                return rates.get(0).getTna().setScale(2, RoundingMode.HALF_UP);
            }
        } catch (Exception e) {
            log.warn("Error getting fixed term rate from rates comparator, using default: {}", e.getMessage());
        }
        return DEFAULT_FIXED_TERM_RATE;
    }

    private BigDecimal getUVARate() {
        BigDecimal monthlyInflation = getMonthlyInflationSafe();
        return monthlyInflation.multiply(BigDecimal.valueOf(12))
                .add(new BigDecimal("1"));
    }

    private BigDecimal getMonthlyInflationSafe() {
        try {
            InflationDTO dto = inflationService.getCurrentInflation();
            if (dto != null && dto.getValue() != null) {
                return dto.getValue();
            }
        } catch (Exception e) {
            log.warn("Could not get inflation, using default: {}", e.getMessage());
        }
        return DEFAULT_MONTHLY_INFLATION;
    }

    private BigDecimal calculateEffectiveAnnualRate(BigDecimal nominalAnnualRate) {
        double rateDecimal = nominalAnnualRate.doubleValue() / 100;
        double effectiveRate = Math.pow(1 + rateDecimal / 365, 365) - 1;
        return BigDecimal.valueOf(effectiveRate * 100);
    }

    private BigDecimal calculateReturn(BigDecimal amount, BigDecimal nominalAnnualRate, int days) {
        return amount.multiply(nominalAnnualRate)
                .multiply(BigDecimal.valueOf(days))
                .divide(BigDecimal.valueOf(36500), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal estimateInflation(int days) {
        BigDecimal monthlyInflation = getMonthlyInflationSafe();
        return monthlyInflation.multiply(BigDecimal.valueOf(days))
                .divide(BigDecimal.valueOf(30), 2, RoundingMode.HALF_UP);
    }

    private List<SimulationResponseDTO.MonthlyProjection> generateProjection(
            BigDecimal initialAmount, BigDecimal nominalAnnualRate, int term, boolean reinvest) {
        
        List<SimulationResponseDTO.MonthlyProjection> projection = new ArrayList<>();
        BigDecimal capital = initialAmount;
        int months = Math.min(term / 30, 12);

        for (int month = 1; month <= months; month++) {
            BigDecimal monthlyInterest = capital.multiply(nominalAnnualRate)
                    .divide(BigDecimal.valueOf(1200), 2, RoundingMode.HALF_UP);
            
            if (reinvest) {
                capital = capital.add(monthlyInterest);
            }

            BigDecimal monthlyInflation = getMonthlyInflationSafe();
            BigDecimal realReturn = nominalAnnualRate.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP)
                    .subtract(monthlyInflation);

            projection.add(SimulationResponseDTO.MonthlyProjection.builder()
                    .month(month)
                    .accumulatedCapital(capital.setScale(2, RoundingMode.HALF_UP))
                    .monthlyInterest(monthlyInterest)
                    .estimatedInflation(monthlyInflation)
                    .realReturn(realReturn.setScale(2, RoundingMode.HALF_UP))
                    .build());
        }

        return projection;
    }

    public List<CurrentRate> getCurrentRates() {
        return List.of(
                new CurrentRate(InvestmentType.FIXED_TERM, getRealFixedTermRate()),
                new CurrentRate(InvestmentType.FIXED_TERM_UVA, getUVARate()),
                new CurrentRate(InvestmentType.MONEY_MARKET_FUND, MONEY_MARKET_RATE),
                new CurrentRate(InvestmentType.REPO, REPO_RATE),
                new CurrentRate(InvestmentType.STABLECOIN_DAI, STABLECOIN_RATE)
        );
    }

    public record CurrentRate(InvestmentType type, BigDecimal rate) { }
}
