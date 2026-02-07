package com.finarg.model.dto;

import com.finarg.model.enums.AlertType;
import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertResponseDTO implements Serializable {
    private Long id;
    private AlertType type;
    private String condition;
    private BigDecimal targetValue;
    private boolean active;
    private boolean emailNotification;
    private boolean pushNotification;
    private LocalDateTime lastNotification;
    private LocalDateTime createdAt;
}
