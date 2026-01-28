package com.finarg.scheduler;

import com.finarg.model.dto.CotizacionDTO;
import com.finarg.service.CotizacionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "scheduler.enabled", havingValue = "true", matchIfMissing = true)
public class CotizacionScheduler {

    private final CotizacionService cotizacionService;

    @Scheduled(cron = "${scheduler.cotizaciones.cron:0 */5 * * * *}")
    public void actualizarCotizaciones() {
        log.info("Ejecutando actualizacion programada de cotizaciones");
        
        try {
            cotizacionService.refreshCache();
            List<CotizacionDTO> cotizaciones = cotizacionService.getAllCotizaciones();
            
            for (CotizacionDTO cotizacion : cotizaciones) {
                cotizacionService.guardarCotizacionHistorica(cotizacion);
            }
            
            log.info("Cotizaciones actualizadas: {} tipos", cotizaciones.size());
        } catch (Exception e) {
            log.error("Error actualizando cotizaciones: {}", e.getMessage());
        }
    }
}
