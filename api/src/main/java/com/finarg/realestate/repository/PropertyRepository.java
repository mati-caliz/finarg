package com.finarg.realestate.repository;

import com.finarg.realestate.entity.Property;
import com.finarg.realestate.enums.OperationType;
import com.finarg.realestate.enums.PropertyType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {

    Optional<Property> findByExternalIdAndPortalSource(String externalId, String portalSource);

    List<Property> findByNeighborhoodIdAndIsActiveTrue(Long neighborhoodId);

    List<Property> findByNeighborhoodIdAndPropertyTypeAndOperationTypeAndIsActiveTrue(
        Long neighborhoodId,
        PropertyType propertyType,
        OperationType operationType
    );

    @Query("SELECT p FROM Property p WHERE p.neighborhood.city.id = :cityId "
           + "AND p.isActive = true "
           + "AND (:propertyType IS NULL OR p.propertyType = :propertyType) "
           + "AND (:operationType IS NULL OR p.operationType = :operationType)")
    List<Property> findActiveByCityAndFilters(
        @Param("cityId") Long cityId,
        @Param("propertyType") PropertyType propertyType,
        @Param("operationType") OperationType operationType
    );
}
