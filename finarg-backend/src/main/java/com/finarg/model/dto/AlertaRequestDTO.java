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
    
    private boolean notificarEmail = true;
    
    private boolean notificarPush = false;
}
