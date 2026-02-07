package com.finarg.service;

import com.finarg.client.BcraClient;
import com.finarg.client.DatosGobArClient;
import com.finarg.model.dto.SocialIndicatorsDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class SocialIndicatorsService {

    private final DatosGobArClient datosGobArClient;
    private final BcraClient bcraClient;

    @Cacheable(value = "indicators", key = "'social_ar'", unless = "#result == null")
    public SocialIndicatorsDTO getSocialIndicatorsArgentina() {
        log.info("Fetching social indicators for Argentina from APIs");
        var minimumSalary = datosGobArClient.getLatestMinimumSalary();
        var minimumPension = datosGobArClient.getLatestMinimumPension();
        var canastaBasicaTotal = datosGobArClient.getLatestCanastaBasicaTotal();
        var uva = bcraClient.getUva();
        var cer = bcraClient.getCer();
        if (minimumSalary == null && minimumPension == null && canastaBasicaTotal == null
                && uva == null && cer == null) {
            return null;
        }
        return SocialIndicatorsDTO.builder()
                .minimumSalary(minimumSalary)
                .minimumPension(minimumPension)
                .canastaBasicaTotal(canastaBasicaTotal)
                .uva(uva)
                .cer(cer)
                .build();
    }
}
