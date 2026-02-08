package com.finarg.service;

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

    @Cacheable(value = "indicators", key = "'social_ar'", unless = "#result == null")
    public SocialIndicatorsDTO getSocialIndicatorsArgentina() {
        log.info("Fetching social indicators for Argentina from APIs");
        var minimumSalary = datosGobArClient.getLatestMinimumSalary();
        var minimumPension = datosGobArClient.getLatestMinimumPension();
        var totalBasicBasket = datosGobArClient.getLatestCanastaBasicaTotal();
        var foodBasicBasket = datosGobArClient.getLatestCanastaBasicaAlimentaria();
        var ripteSalary = datosGobArClient.getLatestSalarioRipte();
        var uva = datosGobArClient.getLatestUva();
        var cer = datosGobArClient.getLatestCer();
        if (minimumSalary == null && minimumPension == null && totalBasicBasket == null
                && foodBasicBasket == null && ripteSalary == null
                && uva == null && cer == null) {
            return null;
        }
        return SocialIndicatorsDTO.builder()
                .minimumSalary(minimumSalary)
                .minimumPension(minimumPension)
                .totalBasicBasket(totalBasicBasket)
                .foodBasicBasket(foodBasicBasket)
                .ripteSalary(ripteSalary)
                .uva(uva)
                .cer(cer)
                .build();
    }
}
