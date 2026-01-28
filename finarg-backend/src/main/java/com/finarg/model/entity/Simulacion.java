package com.finarg.model.entity;

import com.finarg.model.enums.TipoInversion;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "simulaciones")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Simulacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_inversion", nullable = false)
    private TipoInversion tipoInversion;

    @Column(name = "monto_inicial", nullable = false)
    private BigDecimal montoInicial;

    @Column(name = "plazo_dias", nullable = false)
    private Integer plazoDias;

    @Column(name = "tasa_aplicada")
    private BigDecimal tasaAplicada;

    @Column(name = "rendimiento_estimado")
    private BigDecimal rendimientoEstimado;

    @Column(name = "monto_final")
    private BigDecimal montoFinal;

    @Column(columnDefinition = "TEXT")
    private String parametros;

    @Column(columnDefinition = "TEXT")
    private String resultado;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
