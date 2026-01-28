package com.finarg.model.dto;

import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GananciasResponseDTO implements Serializable {
    
    private BigDecimal sueldoBrutoAnual;
    private BigDecimal totalDeducciones;
    private BigDecimal gananciaNetaSujetaAImpuesto;
    private BigDecimal impuestoAnual;
    private BigDecimal impuestoMensual;
    private BigDecimal alicuotaEfectiva;
    private BigDecimal sueldoNetoMensual;
    
    private DetalleCalculo detalleCalculo;
    private List<TramoImpuesto> desglosePorTramo;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DetalleCalculo implements Serializable {
        private BigDecimal minimoNoImponible;
        private BigDecimal deduccionEspecial;
        private BigDecimal cargasFamilia;
        private BigDecimal deduccionesPersonales;
        private BigDecimal totalDeduccionesPermitidas;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TramoImpuesto implements Serializable {
        private int tramo;
        private BigDecimal desde;
        private BigDecimal hasta;
        private BigDecimal alicuota;
        private BigDecimal baseImponible;
        private BigDecimal impuestoTramo;
    }
}
