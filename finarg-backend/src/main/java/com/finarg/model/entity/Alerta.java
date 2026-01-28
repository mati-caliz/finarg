package com.finarg.model.entity;

import com.finarg.model.enums.TipoAlerta;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "alertas")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Alerta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoAlerta tipo;

    @Column(length = 500)
    private String condicion;

    @Column(name = "valor_objetivo")
    private BigDecimal valorObjetivo;

    private boolean activa = true;

    @Column(name = "notificar_email")
    private boolean notificarEmail = true;

    @Column(name = "notificar_push")
    private boolean notificarPush = false;

    @Column(name = "ultima_notificacion")
    private LocalDateTime ultimaNotificacion;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
