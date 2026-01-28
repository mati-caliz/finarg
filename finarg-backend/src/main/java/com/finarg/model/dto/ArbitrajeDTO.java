package com.finarg.model.dto;

import com.finarg.model.enums.TipoDolar;
import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArbitrajeDTO implements Serializable {
    private TipoDolar tipoOrigen;
    private TipoDolar tipoDestino;
    private BigDecimal cotizacionOrigen;
    private BigDecimal cotizacionDestino;
    private BigDecimal spreadPorcentaje;
    private BigDecimal gananciaEstimadaPor1000USD;
    private String descripcion;
    private String pasos;
    private boolean viable;
    private String riesgo;
}
