package com.finarg.investments.etf.service;

import com.finarg.investments.etf.dto.EtfDTO;
import com.finarg.investments.stocks.client.DolaritoMervalClient;
import com.finarg.shared.util.BigDecimalUtils;
import com.finarg.shared.util.DateTimeUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class EtfService {
    private final DolaritoMervalClient dolaritoMervalClient;

    private static final List<String> POPULAR_ETFS = List.of(
            "SPY_US", "QQQ_US", "DIA_US", "EEM_US", "GLD_US", "TLT_US", "IWM_US", "VTI_US"
    );

    @Cacheable(value = "etf", key = "'popular'")
    public List<EtfDTO> getPopularEtfs() {
        log.info("Fetching popular ETF prices from dolarito.ar");

        DolaritoMervalClient.DolaritoMervalResponse mervalData = dolaritoMervalClient.getMervalData();

        if (mervalData.getEtfs() == null || mervalData.getEtfs().getBody() == null
                || mervalData.getEtfs().getBody().isEmpty()) {
            log.warn("No ETF data available");
            return List.of();
        }

        return mervalData.getEtfs().getBody().stream()
                .filter(Objects::nonNull)
                .filter(etf -> POPULAR_ETFS.contains(etf.getEspecie()))
                .sorted(Comparator.comparing(
                        etf -> POPULAR_ETFS.indexOf(etf.getEspecie())
                ))
                .map(this::mapToEtfDTO)
                .toList();
    }

    private EtfDTO mapToEtfDTO(DolaritoMervalClient.EtfItem etf) {
        String ticker = etf.getEspecie() != null
                ? etf.getEspecie().replace("_US", "")
                : "";

        BigDecimal changePercent = BigDecimalUtils.orZero(etf.getVariacion());
        BigDecimal change = BigDecimalUtils.percentageChange(etf.getUltimo(), changePercent);

        return EtfDTO.builder()
                .ticker(ticker)
                .name(etf.getNombre() != null ? etf.getNombre() : ticker)
                .price(BigDecimalUtils.orZero(etf.getUltimo()))
                .change(change)
                .changePercent(changePercent)
                .volume(BigDecimal.ZERO)
                .aum(null)
                .expenseRatio(null)
                .currency("USD")
                .lastUpdate(DateTimeUtils.fromEpochMillis(etf.getTimestamp()))
                .build();
    }
}
