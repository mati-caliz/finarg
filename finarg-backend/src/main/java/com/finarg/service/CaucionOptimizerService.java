package com.finarg.service;

import com.finarg.model.dto.SimulacionRequestDTO;
import com.finarg.model.dto.SimulacionResponseDTO;
import com.finarg.model.enums.TipoInversion;
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

    private final SimuladorService simuladorService;

    private static final BigDecimal TASA_CAUCION_COLOCADORA_1D = new BigDecimal("28");
    private static final BigDecimal TASA_CAUCION_COLOCADORA_7D = new BigDecimal("30");
    private static final BigDecimal TASA_CAUCION_COLOCADORA_30D = new BigDecimal("32");

    public Map<String, Object> optimizar(BigDecimal monto, int plazoDias) {
        log.info("Optimizando caucion: monto={}, plazo={}", monto, plazoDias);

        Map<String, Object> resultado = new HashMap<>();

        BigDecimal tasaCaucion = obtenerTasaCaucion(plazoDias);
        BigDecimal rendimientoCaucion = calcularRendimiento(monto, tasaCaucion, plazoDias);

        SimulacionResponseDTO simulacionPF = simuladorService.simular(
                SimulacionRequestDTO.builder()
                        .montoInicial(monto)
                        .tipoInversion(TipoInversion.PLAZO_FIJO)
                        .plazoDias(plazoDias)
                        .build()
        );

        SimulacionResponseDTO simulacionFCI = simuladorService.simular(
                SimulacionRequestDTO.builder()
                        .montoInicial(monto)
                        .tipoInversion(TipoInversion.FCI_MONEY_MARKET)
                        .plazoDias(plazoDias)
                        .build()
        );

        resultado.put("monto", monto);
        resultado.put("plazoDias", plazoDias);
        resultado.put("caucion", Map.of(
                "tasa", tasaCaucion,
                "rendimiento", rendimientoCaucion,
                "montoFinal", monto.add(rendimientoCaucion)
        ));
        resultado.put("plazoFijo", Map.of(
                "tasa", simulacionPF.getTasaTNA(),
                "rendimiento", simulacionPF.getRendimientoNominal(),
                "montoFinal", simulacionPF.getMontoFinal()
        ));
        resultado.put("fciMoneyMarket", Map.of(
                "tasa", simulacionFCI.getTasaTNA(),
                "rendimiento", simulacionFCI.getRendimientoNominal(),
                "montoFinal", simulacionFCI.getMontoFinal()
        ));

        String mejorOpcion = "caucion";
        BigDecimal mejorRendimiento = rendimientoCaucion;

        if (simulacionPF.getRendimientoNominal().compareTo(mejorRendimiento) > 0) {
            mejorOpcion = "plazoFijo";
            mejorRendimiento = simulacionPF.getRendimientoNominal();
        }
        if (simulacionFCI.getRendimientoNominal().compareTo(mejorRendimiento) > 0) {
            mejorOpcion = "fciMoneyMarket";
        }

        resultado.put("recomendacion", mejorOpcion);
        resultado.put("ventajas", obtenerVentajas(mejorOpcion, plazoDias));

        return resultado;
    }

    private BigDecimal obtenerTasaCaucion(int plazoDias) {
        if (plazoDias <= 1) {
            return TASA_CAUCION_COLOCADORA_1D;
        } else if (plazoDias <= 7) {
            return TASA_CAUCION_COLOCADORA_7D;
        } else {
            return TASA_CAUCION_COLOCADORA_30D;
        }
    }

    private BigDecimal calcularRendimiento(BigDecimal monto, BigDecimal tasa, int dias) {
        return monto.multiply(tasa)
                .multiply(BigDecimal.valueOf(dias))
                .divide(BigDecimal.valueOf(36500), 2, RoundingMode.HALF_UP);
    }

    private Map<String, String> obtenerVentajas(String opcion, int plazo) {
        return switch (opcion) {
            case "caucion" -> Map.of(
                    "liquidez", "Disponibilidad inmediata al vencimiento",
                    "seguridad", "Garantizado por BYMA",
                    "flexibilidad", "Plazos desde 1 dia"
            );
            case "plazoFijo" -> Map.of(
                    "simplicidad", "Facil de operar desde homebanking",
                    "garantia", "Garantizado por SEDESA hasta cierto monto",
                    "ideal", plazo >= 30
                            ? "Ideal para plazos de 30+ dias"
                            : "Considerar otras opciones para plazos cortos"
            );
            case "fciMoneyMarket" -> Map.of(
                    "liquidez", "Rescate en 24-48hs",
                    "diversificacion", "Cartera diversificada",
                    "profesional", "Gestion profesional del fondo"
            );
            default -> Map.of();
        };
    }
}
