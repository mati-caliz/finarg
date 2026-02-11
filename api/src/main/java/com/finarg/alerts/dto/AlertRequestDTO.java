package com.finarg.alerts.dto;

import com.finarg.shared.enums.AlertType;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertRequestDTO {
    
    @NotNull(message = "Alert type is required")
    private AlertType type;
    
    @Size(max = 500, message = "Condition must not exceed 500 characters")
    private String condition;
    
    private BigDecimal targetValue;

    @Builder.Default
    private boolean emailNotification = true;

    @Builder.Default
    private boolean pushNotification = false;
}
