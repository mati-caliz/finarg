package com.finarg.model.dto;

import com.finarg.model.enums.TipoAlerta;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertaRequestDTO {
    
    @NotNull(message = "El tipo de alerta es requerido")
    private TipoAlerta tipo;
    
    private String condicion;
    
    private BigDecimal valorObjetivo;

    @Builder.Default
    private boolean notificarEmail = true;

    @Builder.Default
    private boolean notificarPush = false;
}
