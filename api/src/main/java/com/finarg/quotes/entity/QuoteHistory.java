package com.finarg.quotes.entity;

import com.finarg.shared.enums.Country;
import com.finarg.shared.enums.CurrencyType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "quote_history", indexes = {
    @Index(name = "idx_quote_type_date", columnList = "type, date"),
    @Index(name = "idx_quote_country_date", columnList = "country, date")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuoteHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CurrencyType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Country country = Country.ARGENTINA;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private BigDecimal buy;

    @Column(nullable = false)
    private BigDecimal sell;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
