package com.finarg.service;

import com.finarg.model.dto.GananciasRequestDTO;
import com.finarg.model.dto.GananciasResponseDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class GananciasCalculatorService {

    // Valores 2025 (actualizables via configuracion)
    private static final BigDecimal MINIMO_NO_IMPONIBLE_ANUAL = new BigDecimal("3091035");
    private static final BigDecimal DEDUCCION_ESPECIAL_4TA = new BigDecimal("14837448");
    private static final BigDecimal CONYUGE = new BigDecimal("2911135");
    private static final BigDecimal HIJO = new BigDecimal("1468096");
    
    // Escalas de alicuotas 2025
    private static final List<TramoEscala> ESCALAS = List.of(
            new TramoEscala(BigDecimal.ZERO, new BigDecimal("1193521"), new BigDecimal("5")),
            new TramoEscala(new BigDecimal("1193521"), new BigDecimal("2387043"), new BigDecimal("9")),
            new TramoEscala(new BigDecimal("2387043"), new BigDecimal("3580564"), new BigDecimal("12")),
            new TramoEscala(new BigDecimal("3580564"), new BigDecimal("5371347"), new BigDecimal("15")),
            new TramoEscala(new BigDecimal("5371347"), new BigDecimal("10742695"), new BigDecimal("19")),
            new TramoEscala(new BigDecimal("10742695"), new BigDecimal("16114042"), new BigDecimal("23")),
            new TramoEscala(new BigDecimal("16114042"), new BigDecimal("24171563"), new BigDecimal("27")),
            new TramoEscala(new BigDecimal("24171563"), new BigDecimal("48343127"), new BigDecimal("31")),
            new TramoEscala(new BigDecimal("48343127"), new BigDecimal("999999999999"), new BigDecimal("35"))
    );

    public GananciasResponseDTO calcular(GananciasRequestDTO request) {
        log.info("Calculando impuesto a las ganancias para sueldo: {}", request.getSueldoBrutoMensual());

        BigDecimal sueldoBrutoAnual = request.getSueldoBrutoMensual().multiply(BigDecimal.valueOf(13)); // + SAC
        
        // Calcular deducciones de ley
        BigDecimal jubilacion = request.getJubilacion() != null ? 
                request.getJubilacion().multiply(BigDecimal.valueOf(12)) : 
                sueldoBrutoAnual.multiply(new BigDecimal("0.11"));
        
        BigDecimal obraSocial = request.getObraSocial() != null ?
                request.getObraSocial().multiply(BigDecimal.valueOf(12)) :
                sueldoBrutoAnual.multiply(new BigDecimal("0.03"));
        
        BigDecimal sindicato = request.getSindicato() != null ?
                request.getSindicato().multiply(BigDecimal.valueOf(12)) :
                BigDecimal.ZERO;

        // Cargas de familia
        BigDecimal cargasFamilia = BigDecimal.ZERO;
        if (request.isTieneConyuge()) {
            cargasFamilia = cargasFamilia.add(CONYUGE);
        }
        cargasFamilia = cargasFamilia.add(HIJO.multiply(BigDecimal.valueOf(request.getCantidadHijos())));

        // Deducciones personales
        BigDecimal deduccionesPersonales = BigDecimal.ZERO;
        if (request.getAlquilerVivienda() != null) {
            BigDecimal maxAlquiler = sueldoBrutoAnual.multiply(new BigDecimal("0.40"));
            deduccionesPersonales = deduccionesPersonales.add(
                    request.getAlquilerVivienda().multiply(BigDecimal.valueOf(12)).min(maxAlquiler)
            );
        }
        if (request.getServicioDomestico() != null) {
            deduccionesPersonales = deduccionesPersonales.add(
                    request.getServicioDomestico().multiply(BigDecimal.valueOf(12)).min(MINIMO_NO_IMPONIBLE_ANUAL)
            );
        }
        if (request.getGastosEducativos() != null) {
            BigDecimal maxEducacion = sueldoBrutoAnual.multiply(new BigDecimal("0.40"));
            deduccionesPersonales = deduccionesPersonales.add(
                    request.getGastosEducativos().multiply(BigDecimal.valueOf(12)).min(maxEducacion)
            );
        }

        // Total deducciones
        BigDecimal totalDeduccionesLey = jubilacion.add(obraSocial).add(sindicato);
        BigDecimal gananciaNetaLey = sueldoBrutoAnual.subtract(totalDeduccionesLey);

        BigDecimal totalDeduccionesPermitidas = MINIMO_NO_IMPONIBLE_ANUAL
                .add(DEDUCCION_ESPECIAL_4TA)
                .add(cargasFamilia)
                .add(deduccionesPersonales);

        BigDecimal gananciaNetaSujetaAImpuesto = gananciaNetaLey.subtract(totalDeduccionesPermitidas);
        
        if (gananciaNetaSujetaAImpuesto.compareTo(BigDecimal.ZERO) < 0) {
            gananciaNetaSujetaAImpuesto = BigDecimal.ZERO;
        }

        // Calcular impuesto por tramos
        List<GananciasResponseDTO.TramoImpuesto> desglose = new ArrayList<>();
        BigDecimal impuestoTotal = BigDecimal.ZERO;
        BigDecimal baseRestante = gananciaNetaSujetaAImpuesto;
        int tramoNum = 1;

        for (TramoEscala escala : ESCALAS) {
            if (baseRestante.compareTo(BigDecimal.ZERO) <= 0) break;

            BigDecimal rangoTramo = escala.hasta.subtract(escala.desde);
            BigDecimal baseTramo = baseRestante.min(rangoTramo);
            BigDecimal impuestoTramo = baseTramo.multiply(escala.alicuota)
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            if (baseTramo.compareTo(BigDecimal.ZERO) > 0) {
                desglose.add(GananciasResponseDTO.TramoImpuesto.builder()
                        .tramo(tramoNum++)
                        .desde(escala.desde)
                        .hasta(escala.hasta)
                        .alicuota(escala.alicuota)
                        .baseImponible(baseTramo)
                        .impuestoTramo(impuestoTramo)
                        .build());
            }

            impuestoTotal = impuestoTotal.add(impuestoTramo);
            baseRestante = baseRestante.subtract(rangoTramo);
        }

        BigDecimal impuestoMensual = impuestoTotal.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
        BigDecimal sueldoNetoMensual = request.getSueldoBrutoMensual()
                .subtract(totalDeduccionesLey.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP))
                .subtract(impuestoMensual);

        BigDecimal alicuotaEfectiva = sueldoBrutoAnual.compareTo(BigDecimal.ZERO) > 0 ?
                impuestoTotal.divide(sueldoBrutoAnual, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)) :
                BigDecimal.ZERO;

        return GananciasResponseDTO.builder()
                .sueldoBrutoAnual(sueldoBrutoAnual.setScale(2, RoundingMode.HALF_UP))
                .totalDeducciones(totalDeduccionesLey.add(totalDeduccionesPermitidas).setScale(2, RoundingMode.HALF_UP))
                .gananciaNetaSujetaAImpuesto(gananciaNetaSujetaAImpuesto.setScale(2, RoundingMode.HALF_UP))
                .impuestoAnual(impuestoTotal.setScale(2, RoundingMode.HALF_UP))
                .impuestoMensual(impuestoMensual)
                .alicuotaEfectiva(alicuotaEfectiva.setScale(2, RoundingMode.HALF_UP))
                .sueldoNetoMensual(sueldoNetoMensual.setScale(2, RoundingMode.HALF_UP))
                .detalleCalculo(GananciasResponseDTO.DetalleCalculo.builder()
                        .minimoNoImponible(MINIMO_NO_IMPONIBLE_ANUAL)
                        .deduccionEspecial(DEDUCCION_ESPECIAL_4TA)
                        .cargasFamilia(cargasFamilia)
                        .deduccionesPersonales(deduccionesPersonales)
                        .totalDeduccionesPermitidas(totalDeduccionesPermitidas)
                        .build())
                .desglosePorTramo(desglose)
                .build();
    }

    private record TramoEscala(BigDecimal desde, BigDecimal hasta, BigDecimal alicuota) {}
}
