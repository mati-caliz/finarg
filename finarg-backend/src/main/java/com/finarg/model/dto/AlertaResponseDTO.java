package com.finarg.model.dto;

import com.finarg.model.enums.TipoAlerta;
import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertaResponseDTO implements Serializable {
    private Long id;
    private TipoAlerta tipo;
    private String condicion;
    private BigDecimal valorObjetivo;
    private boolean activa;
    private boolean notificarEmail;
    private boolean notificarPush;
    private LocalDateTime ultimaNotificacion;
    private LocalDateTime createdAt;
}
