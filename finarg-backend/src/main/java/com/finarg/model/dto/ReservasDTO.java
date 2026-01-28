package com.finarg.model.dto;

import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservasDTO implements Serializable {
    private BigDecimal reservasBrutas;
    private BigDecimal reservasNetas;
    private BigDecimal swapChina;
    private BigDecimal encajesBancarios;
    private BigDecimal depositosGobierno;
    private LocalDate fecha;
    private BigDecimal variacionDiaria;
    private String tendencia;
}
