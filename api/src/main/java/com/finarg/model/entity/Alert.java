package com.finarg.model.entity;

import com.finarg.model.enums.AlertType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "alerts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlertType type;

    @Column(length = 500)
    private String condition;

    @Column(name = "target_value")
    private BigDecimal targetValue;

    @Builder.Default
    private boolean active = true;

    @Builder.Default
    @Column(name = "email_notification")
    private boolean emailNotification = true;

    @Builder.Default
    @Column(name = "push_notification")
    private boolean pushNotification = false;

    @Column(name = "last_notification")
    private LocalDateTime lastNotification;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
