package com.finarg.service;

import com.finarg.model.dto.ArbitrageDTO;
import com.finarg.model.dto.QuoteDTO;
import com.finarg.model.enums.Country;
import com.finarg.model.enums.CurrencyType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ArbitrageDetectorService {

    private final QuoteService quoteService;

    private static final BigDecimal ESTIMATED_COMMISSION = new BigDecimal("0.5");
    private static final BigDecimal PROFITABILITY_THRESHOLD = new BigDecimal("1.5");

    public List<ArbitrageDTO> detectOpportunities() {
        log.info("Detecting arbitrage opportunities");
        
        Map<CurrencyType, QuoteDTO> quotes = quoteService.getQuotesMap(Country.ARGENTINA);
        
        if (quotes == null || quotes.isEmpty()) {
            log.warn("No quotes available for arbitrage detection");
            return List.of();
        }
        
        List<ArbitrageDTO> opportunities = new ArrayList<>();

        ArbitrageDTO mepBlue = analyzeArbitrage(
                quotes.get(CurrencyType.AR_MEP),
                quotes.get(CurrencyType.AR_BLUE),
                "Comprar MEP, vender Blue",
                "1. Comprar bonos AL30 en pesos\n2. Vender AL30 por dólares MEP\n3. Retirar dólares\n4. Vender en mercado Blue"
        );
        if (mepBlue != null) {
            opportunities.add(mepBlue);
        }

        ArbitrageDTO cclBlue = analyzeArbitrage(
                quotes.get(CurrencyType.AR_CCL),
                quotes.get(CurrencyType.AR_BLUE),
                "Comprar CCL, vender Blue",
                "1. Comprar bonos AL30 en pesos\n2. Transferir a broker del exterior\n3. Vender por dólares\n4. Traer y vender en Blue"
        );
        if (cclBlue != null) {
            opportunities.add(cclBlue);
        }

        ArbitrageDTO cryptoBlue = analyzeArbitrage(
                quotes.get(CurrencyType.AR_CRYPTO),
                quotes.get(CurrencyType.AR_BLUE),
                "Comprar Crypto, vender Blue",
                "1. Comprar USDT/DAI en exchange argentino\n2. Transferir a wallet\n3. Vender P2P o en cueva"
        );
        if (cryptoBlue != null) {
            opportunities.add(cryptoBlue);
        }

        ArbitrageDTO blueMep = analyzeArbitrage(
                quotes.get(CurrencyType.AR_BLUE),
                quotes.get(CurrencyType.AR_MEP),
                "Comprar Blue, vender MEP",
                "1. Comprar dólares Blue\n2. Depositar en banco\n3. Comprar bonos AL30D\n4. Vender por pesos"
        );
        if (blueMep != null) {
            opportunities.add(blueMep);
        }

        ArbitrageDTO officialBlue = analyzeReverseArbitrage(
                quotes.get(CurrencyType.AR_OFFICIAL),
                quotes.get(CurrencyType.AR_BLUE)
        );
        if (officialBlue != null) {
            opportunities.add(officialBlue);
        }

        log.info("Found {} arbitrage opportunities ({} viable)", 
                opportunities.size(), 
                opportunities.stream().filter(ArbitrageDTO::isViable).count());
        return opportunities;
    }

    private ArbitrageDTO analyzeArbitrage(QuoteDTO source, QuoteDTO target, 
                                          String description, String steps) {
        if (source == null || target == null) {
            return null;
        }

        BigDecimal buyPrice = source.getSell();
        BigDecimal sellPrice = target.getBuy();

        if (buyPrice.compareTo(BigDecimal.ZERO) == 0) {
            return null;
        }

        BigDecimal grossSpread = sellPrice.subtract(buyPrice)
                .divide(buyPrice, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));

        BigDecimal netSpread = grossSpread.subtract(ESTIMATED_COMMISSION.multiply(BigDecimal.valueOf(2)));
        
        BigDecimal profit1000 = new BigDecimal("1000")
                .multiply(netSpread)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        boolean viable = netSpread.compareTo(PROFITABILITY_THRESHOLD) > 0;
        String risk = calculateRisk(netSpread);

        return ArbitrageDTO.builder()
                .sourceType(source.getType())
                .targetType(target.getType())
                .sourceRate(buyPrice)
                .targetRate(sellPrice)
                .spreadPercentage(netSpread.setScale(2, RoundingMode.HALF_UP))
                .estimatedProfitPer1000USD(profit1000)
                .description(description)
                .steps(steps)
                .viable(viable)
                .risk(risk)
                .build();
    }

    private ArbitrageDTO analyzeReverseArbitrage(QuoteDTO source, QuoteDTO target) {
        if (source == null || target == null) {
            return null;
        }

        BigDecimal buyPrice = source.getSell();
        BigDecimal sellPrice = target.getBuy();

        if (buyPrice.compareTo(BigDecimal.ZERO) == 0) {
            return null;
        }

        BigDecimal grossSpread = sellPrice.subtract(buyPrice)
                .divide(buyPrice, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));

        boolean viable = grossSpread.compareTo(new BigDecimal("20")) > 0;

        return ArbitrageDTO.builder()
                .sourceType(source.getType())
                .targetType(target.getType())
                .sourceRate(buyPrice)
                .targetRate(sellPrice)
                .spreadPercentage(grossSpread.setScale(2, RoundingMode.HALF_UP))
                .estimatedProfitPer1000USD(BigDecimal.ZERO)
                .description("Buy Official (if you have access), sell Blue")
                .steps("Only applies if you have access to official dollar (importer, etc)")
                .viable(viable)
                .risk("high")
                .build();
    }

    private String calculateRisk(BigDecimal spread) {
        if (spread.compareTo(new BigDecimal("5")) > 0) {
            return "low";
        } else if (spread.compareTo(new BigDecimal("2")) > 0) {
            return "medium";
        } else {
            return "high";
        }
    }
}
