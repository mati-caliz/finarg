package com.finarg.service;

import com.finarg.client.ArgentinaDatosClient;
import com.finarg.model.dto.AjusteInflacionDTO;
import com.finarg.model.dto.InflacionDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class InflacionService {

    private final ArgentinaDatosClient argentinaDatosClient;

    @Cacheable(value = "inflacion", key = "'mensual_' + #limit")
    public List<InflacionDTO> getInflacionMensual(int limit) {
        log.info("Fetching inflacion mensual, limit: {}", limit);
        return argentinaDatosClient.getInflacionMensual(limit);
    }

    @Cacheable(value = "inflacion", key = "'actual'")
    public InflacionDTO getInflacionActual() {
        List<InflacionDTO> inflaciones = argentinaDatosClient.getInflacionMensual(1);
        if (inflaciones.isEmpty()) {
            return InflacionDTO.builder()
                    .fecha(LocalDate.now())
                    .valor(BigDecimal.ZERO)
                    .build();
        }
        return inflaciones.get(0);
    }

    @Cacheable(value = "inflacion", key = "'interanual'")
    public List<InflacionDTO> getInflacionInteranual() {
        return argentinaDatosClient.getInflacionInteranual();
    }

    public AjusteInflacionDTO ajustarPorInflacion(BigDecimal montoOriginal,
                                                     LocalDate fechaOrigen,
                                                     LocalDate fechaDestino) {
        log.info("Ajustando por inflacion: {} desde {} hasta {}", montoOriginal, fechaOrigen, fechaDestino);

        List<InflacionDTO> inflaciones = argentinaDatosClient.getInflacionMensual(120);
        
        BigDecimal factorAcumulado = BigDecimal.ONE;

        for (InflacionDTO inf : inflaciones) {
            if (inf.getFecha() != null
                    && !inf.getFecha().isBefore(fechaOrigen)
                    && !inf.getFecha().isAfter(fechaDestino)) {
                
                BigDecimal factorMes = BigDecimal.ONE.add(
                        inf.getValor().divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP)
                );
                factorAcumulado = factorAcumulado.multiply(factorMes);
            }
        }

        BigDecimal montoAjustado = montoOriginal.multiply(factorAcumulado)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal inflacionAcumulada = factorAcumulado.subtract(BigDecimal.ONE)
                .multiply(BigDecimal.valueOf(100))
                .setScale(2, RoundingMode.HALF_UP);

        int mesesTranscurridos = (int) ChronoUnit.MONTHS.between(fechaOrigen, fechaDestino);

        return AjusteInflacionDTO.builder()
                .montoOriginal(montoOriginal)
                .montoAjustado(montoAjustado)
                .fechaOrigen(fechaOrigen)
                .fechaDestino(fechaDestino)
                .inflacionAcumulada(inflacionAcumulada)
                .mesesTranscurridos(mesesTranscurridos)
                .build();
    }

}
