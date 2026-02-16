package com.finarg.payment.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "mobbex_webhook_log")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MobbexWebhookLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "webhook_id", nullable = false, unique = true)
    private String webhookId;

    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType;

    @Column(name = "subscriber_id", length = 255)
    private String subscriberId;

    @Column(name = "execution_id", length = 255)
    private String executionId;

    @Column(length = 50)
    private String status;

    @Column(name = "processed_at", nullable = false)
    private LocalDateTime processedAt;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "raw_payload", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> rawPayload;
}
