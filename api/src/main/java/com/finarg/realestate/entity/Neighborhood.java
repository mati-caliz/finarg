package com.finarg.realestate.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "neighborhoods",
    indexes = {
        @Index(name = "idx_neighborhood_city", columnList = "city_id"),
        @Index(name = "idx_neighborhood_code", columnList = "code")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_neighborhood_code_city", columnNames = {"code", "city_id"})
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Neighborhood {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "city_id", nullable = false)
    private City city;

    @Column(name = "zone_name", length = 100)
    private String zoneName;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (isActive == null) {
            isActive = true;
        }
    }
}
