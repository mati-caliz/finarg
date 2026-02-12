package com.finarg.realestate.entity;

import com.finarg.realestate.enums.OperationType;
import com.finarg.realestate.enums.PropertyCondition;
import com.finarg.realestate.enums.PropertyType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "properties",
    indexes = {
        @Index(name = "idx_property_neighborhood", columnList = "neighborhood_id"),
        @Index(name = "idx_property_external_id", columnList = "external_id, portal_source"),
        @Index(name = "idx_property_type_operation", columnList = "property_type, operation_type"),
        @Index(name = "idx_property_last_seen", columnList = "last_seen_at")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_property_external", columnNames = {"external_id", "portal_source"})
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "external_id", nullable = false, length = 100)
    private String externalId;

    @Column(name = "portal_source", nullable = false, length = 50)
    private String portalSource;

    @Enumerated(EnumType.STRING)
    @Column(name = "property_type", nullable = false, length = 50)
    private PropertyType propertyType;

    @Enumerated(EnumType.STRING)
    @Column(name = "operation_type", nullable = false, length = 20)
    private OperationType operationType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "neighborhood_id", nullable = false)
    private Neighborhood neighborhood;

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "surface_m2", precision = 12, scale = 2)
    private BigDecimal surfaceM2;

    @Column(name = "covered_surface_m2", precision = 12, scale = 2)
    private BigDecimal coveredSurfaceM2;

    @Column(name = "bedrooms")
    private Integer bedrooms;

    @Column(name = "bathrooms")
    private Integer bathrooms;

    @Enumerated(EnumType.STRING)
    @Column(name = "property_condition", length = 50)
    private PropertyCondition propertyCondition;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "last_seen_at")
    private LocalDateTime lastSeenAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        lastSeenAt = LocalDateTime.now();
        if (isActive == null) {
            isActive = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        lastSeenAt = LocalDateTime.now();
    }
}
