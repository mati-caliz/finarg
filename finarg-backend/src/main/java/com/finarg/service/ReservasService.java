package com.finarg.service;

import com.finarg.client.DatosGobArClient;
import com.finarg.model.dto.ReservasDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReservasService {

    private final DatosGobArClient datosGobArClient;

    private static final BigDecimal SWAP_CHINA = new BigDecimal("18000");
    private static final BigDecimal ENCAJES_ESTIMADOS = new BigDecimal("10000");
    private static final BigDecimal DEPOSITOS_GOBIERNO = new BigDecimal("3000");

    @Cacheable(value = "reservas", key = "'actuales'")
    public ReservasDTO getReservasActuales() {
        log.info("Fetching reservas actuales del BCRA");

        List<DatosGobArClient.SeriesDataPoint> reservas = datosGobArClient.getReservasBCRA(2);

        if (reservas.isEmpty()) {
            return ReservasDTO.builder()
                    .reservasBrutas(BigDecimal.ZERO)
                    .reservasNetas(BigDecimal.ZERO)
                    .fecha(LocalDate.now())
                    .tendencia("sin_datos")
                    .build();
        }

        DatosGobArClient.SeriesDataPoint ultimo = reservas.get(0);
        BigDecimal reservasBrutas = ultimo.getValor();

        BigDecimal reservasNetas = reservasBrutas
                .subtract(SWAP_CHINA)
                .subtract(ENCAJES_ESTIMADOS)
                .subtract(DEPOSITOS_GOBIERNO);

        BigDecimal variacion = BigDecimal.ZERO;
        String tendencia = "estable";

        if (reservas.size() > 1) {
            DatosGobArClient.SeriesDataPoint anterior = reservas.get(1);
            variacion = reservasBrutas.subtract(anterior.getValor());
            
            if (variacion.compareTo(BigDecimal.ZERO) > 0) {
                tendencia = "subiendo";
            } else if (variacion.compareTo(BigDecimal.ZERO) < 0) {
                tendencia = "bajando";
            }
        }

        return ReservasDTO.builder()
                .reservasBrutas(reservasBrutas.setScale(0, RoundingMode.HALF_UP))
                .reservasNetas(reservasNetas.setScale(0, RoundingMode.HALF_UP))
                .swapChina(SWAP_CHINA)
                .encajesBancarios(ENCAJES_ESTIMADOS)
                .depositosGobierno(DEPOSITOS_GOBIERNO)
                .fecha(ultimo.getFecha())
                .variacionDiaria(variacion.setScale(0, RoundingMode.HALF_UP))
                .tendencia(tendencia)
                .build();
    }

    @Cacheable(value = "reservas", key = "'historico_' + #dias")
    public List<DatosGobArClient.SeriesDataPoint> getHistorico(int dias) {
        return datosGobArClient.getReservasBCRA(dias);
    }
}
