package com.finarg.model.entity;

import com.finarg.model.enums.TipoDolar;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "cotizaciones_historicas", indexes = {
    @Index(name = "idx_cotizacion_tipo_fecha", columnList = "tipo, fecha")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CotizacionHistorica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoDolar tipo;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(nullable = false)
    private BigDecimal compra;

    @Column(nullable = false)
    private BigDecimal venta;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
