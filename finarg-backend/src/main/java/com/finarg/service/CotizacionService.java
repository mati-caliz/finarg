package com.finarg.service;

import com.finarg.client.DolarApiClient;
import com.finarg.model.dto.BrechaDTO;
import com.finarg.model.dto.CotizacionDTO;
import com.finarg.model.entity.CotizacionHistorica;
import com.finarg.model.enums.NivelBrecha;
import com.finarg.model.enums.TipoDolar;
import com.finarg.repository.CotizacionHistoricaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CotizacionService {

    private final DolarApiClient dolarApiClient;
    private final CotizacionHistoricaRepository cotizacionHistoricaRepository;

    @Cacheable(value = "cotizaciones", key = "'all'")
    public List<CotizacionDTO> getAllCotizaciones() {
        log.info("Fetching all cotizaciones from API");
        return dolarApiClient.getAllCotizaciones();
    }

    @Cacheable(value = "cotizaciones", key = "#tipo.codigo")
    public CotizacionDTO getCotizacion(TipoDolar tipo) {
        log.info("Fetching cotizacion for tipo: {}", tipo);
        return dolarApiClient.getCotizacionBlocking(tipo);
    }

    public Map<TipoDolar, CotizacionDTO> getCotizacionesMap() {
        return dolarApiClient.getAllCotizaciones().stream()
                .collect(Collectors.toMap(CotizacionDTO::getTipo, c -> c, (a, b) -> a));
    }

    @Cacheable(value = "cotizaciones", key = "'brecha'")
    public BrechaDTO calcularBrecha() {
        CotizacionDTO oficial = dolarApiClient.getCotizacionBlocking(TipoDolar.OFICIAL);
        CotizacionDTO blue = dolarApiClient.getCotizacionBlocking(TipoDolar.BLUE);

        if (oficial == null || blue == null) {
            return BrechaDTO.builder()
                    .porcentajeBrecha(BigDecimal.ZERO)
                    .nivel(NivelBrecha.BAJA)
                    .colorSemaforo("#22c55e")
                    .descripcion("No hay datos disponibles")
                    .build();
        }

        BigDecimal ventaOficial = oficial.getVenta();
        BigDecimal ventaBlue = blue.getVenta();

        BigDecimal brecha = ventaBlue.subtract(ventaOficial)
                .divide(ventaOficial, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));

        NivelBrecha nivel = NivelBrecha.fromPorcentaje(brecha.doubleValue());
        String color = switch (nivel) {
            case BAJA -> "#22c55e";
            case MEDIA -> "#eab308";
            case ALTA -> "#ef4444";
        };

        String descripcion = switch (nivel) {
            case BAJA -> "Brecha baja - Mercado estable";
            case MEDIA -> "Brecha moderada - Atencion";
            case ALTA -> "Brecha alta - Tension cambiaria";
        };

        return BrechaDTO.builder()
                .dolarOficial(ventaOficial)
                .dolarBlue(ventaBlue)
                .porcentajeBrecha(brecha.setScale(2, RoundingMode.HALF_UP))
                .nivel(nivel)
                .colorSemaforo(color)
                .descripcion(descripcion)
                .build();
    }

    @Cacheable(value = "historico", key = "#tipo.codigo + '_' + #desde + '_' + #hasta")
    public List<CotizacionHistorica> getHistorico(TipoDolar tipo, LocalDate desde, LocalDate hasta) {
        return cotizacionHistoricaRepository.findByTipoAndFechaBetweenOrderByFechaAsc(tipo, desde, hasta);
    }

    @CacheEvict(value = "cotizaciones", allEntries = true)
    public void refreshCache() {
        log.info("Cache de cotizaciones limpiado");
    }

    public void guardarCotizacionHistorica(CotizacionDTO cotizacion) {
        LocalDate hoy = LocalDate.now();
        if (!cotizacionHistoricaRepository.existsByTipoAndFecha(cotizacion.getTipo(), hoy)) {
            CotizacionHistorica historica = CotizacionHistorica.builder()
                    .tipo(cotizacion.getTipo())
                    .fecha(hoy)
                    .compra(cotizacion.getCompra())
                    .venta(cotizacion.getVenta())
                    .build();
            cotizacionHistoricaRepository.save(historica);
            log.info("Guardada cotizacion historica: {} - {}", cotizacion.getTipo(), hoy);
        }
    }
}
