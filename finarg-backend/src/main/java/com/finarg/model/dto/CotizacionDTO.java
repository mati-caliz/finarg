package com.finarg.model.dto;

import com.finarg.model.enums.TipoDolar;
import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CotizacionDTO implements Serializable {
    private TipoDolar tipo;
    private String nombre;
    private BigDecimal compra;
    private BigDecimal venta;
    private BigDecimal spread;
    private BigDecimal variacion;
    private LocalDateTime fechaActualizacion;
}
