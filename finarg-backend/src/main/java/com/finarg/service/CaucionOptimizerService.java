package com.finarg.service;

import com.finarg.model.dto.SimulationRequestDTO;
import com.finarg.model.dto.SimulationResponseDTO;
import com.finarg.model.enums.InvestmentType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CaucionOptimizerService {

    private final SimulatorService simulatorService;

    private static final BigDecimal REPO_RATE_1D = new BigDecimal("28");
    private static final BigDecimal REPO_RATE_7D = new BigDecimal("30");
    private static final BigDecimal REPO_RATE_30D = new BigDecimal("32");

    public Map<String, Object> optimize(BigDecimal amount, int termDays) {
        log.info("Optimizing repo: amount={}, term={}", amount, termDays);

        Map<String, Object> result = new HashMap<>();

        BigDecimal repoRate = getRepoRate(termDays);
        BigDecimal repoReturn = calculateReturn(amount, repoRate, termDays);

        SimulationResponseDTO fixedTermSimulation = simulatorService.simulate(
                SimulationRequestDTO.builder()
                        .initialAmount(amount)
                        .investmentType(InvestmentType.FIXED_TERM)
                        .termDays(termDays)
                        .build()
        );

        SimulationResponseDTO moneyMarketSimulation = simulatorService.simulate(
                SimulationRequestDTO.builder()
                        .initialAmount(amount)
                        .investmentType(InvestmentType.MONEY_MARKET_FUND)
                        .termDays(termDays)
                        .build()
        );

        result.put("amount", amount);
        result.put("termDays", termDays);
        result.put("repo", Map.of(
                "rate", repoRate,
                "return", repoReturn,
                "finalAmount", amount.add(repoReturn)
        ));
        result.put("fixedTerm", Map.of(
                "rate", fixedTermSimulation.getNominalAnnualRate(),
                "return", fixedTermSimulation.getNominalReturn(),
                "finalAmount", fixedTermSimulation.getFinalAmount()
        ));
        result.put("moneyMarketFund", Map.of(
                "rate", moneyMarketSimulation.getNominalAnnualRate(),
                "return", moneyMarketSimulation.getNominalReturn(),
                "finalAmount", moneyMarketSimulation.getFinalAmount()
        ));

        String bestOption = "repo";
        BigDecimal bestReturn = repoReturn;

        if (fixedTermSimulation.getNominalReturn().compareTo(bestReturn) > 0) {
            bestOption = "fixedTerm";
            bestReturn = fixedTermSimulation.getNominalReturn();
        }
        if (moneyMarketSimulation.getNominalReturn().compareTo(bestReturn) > 0) {
            bestOption = "moneyMarketFund";
        }

        result.put("recommendation", bestOption);
        result.put("advantages", getAdvantages(bestOption, termDays));

        return result;
    }

    private BigDecimal getRepoRate(int termDays) {
        if (termDays <= 1) {
            return REPO_RATE_1D;
        } else if (termDays <= 7) {
            return REPO_RATE_7D;
        } else {
            return REPO_RATE_30D;
        }
    }

    private BigDecimal calculateReturn(BigDecimal amount, BigDecimal rate, int days) {
        return amount.multiply(rate)
                .multiply(BigDecimal.valueOf(days))
                .divide(BigDecimal.valueOf(36500), 2, RoundingMode.HALF_UP);
    }

    private Map<String, String> getAdvantages(String option, int term) {
        return switch (option) {
            case "repo" -> Map.of(
                    "liquidity", "Immediate availability at maturity",
                    "security", "Guaranteed by BYMA",
                    "flexibility", "Terms starting from 1 day"
            );
            case "fixedTerm" -> Map.of(
                    "simplicity", "Easy to operate from home banking",
                    "guarantee", "Guaranteed by SEDESA up to a certain amount",
                    "ideal", term >= 30
                            ? "Ideal for terms of 30+ days"
                            : "Consider other options for short terms"
            );
            case "moneyMarketFund" -> Map.of(
                    "liquidity", "Redemption in 24-48hrs",
                    "diversification", "Diversified portfolio",
                    "professional", "Professional fund management"
            );
            default -> Map.of();
        };
    }
}
