package com.finarg.model.dto;

import com.finarg.model.enums.TipoInversion;
import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimulacionResponseDTO implements Serializable {
    
    private TipoInversion tipoInversion;
    private BigDecimal montoInicial;
    private Integer plazoDias;
    private BigDecimal tasaTNA;
    private BigDecimal tasaTEA;
    private BigDecimal rendimientoNominal;
    private BigDecimal rendimientoReal;
    private BigDecimal montoFinal;
    private BigDecimal gananciaARS;
    private BigDecimal gananciaUSD;
    private BigDecimal rendimientoEnDolares;
    
    private List<ProyeccionMensual> proyeccion;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProyeccionMensual implements Serializable {
        private int mes;
        private BigDecimal capitalAcumulado;
        private BigDecimal interesesMes;
        private BigDecimal inflacionEstimada;
        private BigDecimal rendimientoReal;
    }
}
