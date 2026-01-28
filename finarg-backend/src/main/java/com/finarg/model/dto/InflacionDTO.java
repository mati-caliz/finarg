package com.finarg.model.dto;

import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InflacionDTO implements Serializable {
    private LocalDate fecha;
    private BigDecimal valor;
    private BigDecimal interanual;
    private BigDecimal acumuladoAnio;
}
