package com.finarg.model.dto;

import com.finarg.model.enums.NivelBrecha;
import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrechaDTO implements Serializable {
    private BigDecimal dolarOficial;
    private BigDecimal dolarBlue;
    private BigDecimal porcentajeBrecha;
    private NivelBrecha nivel;
    private String colorSemaforo;
    private String descripcion;
}
