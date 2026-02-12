package com.finarg.realestate.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "property_prices",
    indexes = {
        @Index(name = "idx_price_property_date", columnList = "property_id, date"),
        @Index(name = "idx_price_date", columnList = "date"),
        @Index(name = "idx_price_currency", columnList = "currency")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyPrice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "price_total", nullable = false, precision = 18, scale = 2)
    private BigDecimal priceTotal;

    @Column(name = "price_per_m2", precision = 15, scale = 2)
    private BigDecimal pricePerM2;

    @Column(name = "currency", nullable = false, length = 3)
    private String currency;

    @Column(name = "expenses", precision = 12, scale = 2)
    private BigDecimal expenses;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
