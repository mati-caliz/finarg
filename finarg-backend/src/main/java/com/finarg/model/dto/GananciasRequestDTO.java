package com.finarg.model.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GananciasRequestDTO {
    
    @NotNull(message = "El sueldo bruto es requerido")
    @Positive(message = "El sueldo bruto debe ser positivo")
    private BigDecimal sueldoBrutoMensual;
    
    @NotNull(message = "El tipo de empleado es requerido")
    private TipoEmpleado tipoEmpleado;
    
    private BigDecimal obraSocial;
    private BigDecimal jubilacion;
    private BigDecimal sindicato;
    
    private boolean tieneConyuge;
    private int cantidadHijos;
    
    private BigDecimal alquilerVivienda;
    private BigDecimal servicioDomestico;
    private BigDecimal gastosEducativos;
    private BigDecimal seguroVida;
    private BigDecimal donaciones;
    private BigDecimal honorariosMedicos;
    
    private List<DeduccionPersonalizada> otrasDeduciones;
    
    public enum TipoEmpleado {
        RELACION_DEPENDENCIA,
        AUTONOMO
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeduccionPersonalizada {
        private String concepto;
        private BigDecimal monto;
    }
}
