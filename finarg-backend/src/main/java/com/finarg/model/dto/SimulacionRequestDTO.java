package com.finarg.model.dto;

import com.finarg.model.enums.TipoInversion;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimulacionRequestDTO {
    
    @NotNull(message = "El monto inicial es requerido")
    @Positive(message = "El monto debe ser positivo")
    private BigDecimal montoInicial;
    
    @NotNull(message = "El tipo de inversion es requerido")
    private TipoInversion tipoInversion;
    
    @NotNull(message = "El plazo es requerido")
    @Min(value = 1, message = "El plazo minimo es 1 dia")
    @Max(value = 365, message = "El plazo maximo es 365 dias")
    private Integer plazoDias;
    
    private boolean reinvertir;
    private BigDecimal tasaPersonalizada;
}
