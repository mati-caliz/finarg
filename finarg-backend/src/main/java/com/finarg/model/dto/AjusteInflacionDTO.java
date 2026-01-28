package com.finarg.model.dto;

import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AjusteInflacionDTO implements Serializable {
    private BigDecimal montoOriginal;
    private BigDecimal montoAjustado;
    private LocalDate fechaOrigen;
    private LocalDate fechaDestino;
    private BigDecimal inflacionAcumulada;
    private int mesesTranscurridos;
}
