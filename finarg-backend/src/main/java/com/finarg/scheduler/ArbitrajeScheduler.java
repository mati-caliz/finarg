package com.finarg.scheduler;

import com.finarg.model.dto.ArbitrajeDTO;
import com.finarg.model.entity.Alerta;
import com.finarg.model.enums.TipoAlerta;
import com.finarg.service.AlertaService;
import com.finarg.service.ArbitrajeDetectorService;
import com.finarg.service.NotificationService;
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
public class ArbitrajeScheduler {

    private final ArbitrajeDetectorService arbitrajeService;
    private final AlertaService alertaService;
    private final NotificationService notificationService;

    @Scheduled(cron = "${scheduler.arbitraje.cron:0 */10 * * * *}")
    public void detectarYNotificarArbitraje() {
        log.info("Ejecutando deteccion programada de arbitraje");
        
        try {
            List<ArbitrajeDTO> oportunidades = arbitrajeService.detectarOportunidades();
            
            if (oportunidades.isEmpty()) {
                log.debug("No se encontraron oportunidades de arbitraje");
                return;
            }

            log.info("Encontradas {} oportunidades de arbitraje", oportunidades.size());

            List<Alerta> alertasArbitraje = alertaService.getAlertasActivas().stream()
                    .filter(a -> a.getTipo() == TipoAlerta.ARBITRAJE)
                    .toList();

            for (Alerta alerta : alertasArbitraje) {
                for (ArbitrajeDTO oportunidad : oportunidades) {
                    if (oportunidad.isViable() && alerta.isNotificarEmail()) {
                        String descripcion = String.format("%s -> %s (Spread: %.2f%%)",
                                oportunidad.getTipoOrigen().getNombre(),
                                oportunidad.getTipoDestino().getNombre(),
                                oportunidad.getSpreadPorcentaje());
                        
                        notificationService.sendArbitrajeAlert(
                                alerta.getUser().getEmail(),
                                descripcion,
                                oportunidad.getGananciaEstimadaPor1000USD().toString()
                        );
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error en deteccion de arbitraje: {}", e.getMessage());
        }
    }
}
