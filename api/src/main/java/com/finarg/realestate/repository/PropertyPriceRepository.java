package com.finarg.realestate.repository;

import com.finarg.realestate.entity.PropertyPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PropertyPriceRepository extends JpaRepository<PropertyPrice, Long> {

    @Query("SELECT pp FROM PropertyPrice pp WHERE pp.property.id IN :propertyIds "
           + "AND pp.currency = :currency "
           + "AND pp.date = (SELECT MAX(pp2.date) FROM PropertyPrice pp2 "
           + "WHERE pp2.property.id = pp.property.id AND pp2.currency = :currency)")
    List<PropertyPrice> findLatestPricesByPropertyIdsAndCurrency(
        @Param("propertyIds") List<Long> propertyIds,
        @Param("currency") String currency
    );

    @Query("SELECT pp FROM PropertyPrice pp WHERE pp.property.id = :propertyId "
           + "AND pp.date <= :date "
           + "ORDER BY pp.date DESC "
           + "LIMIT 1")
    Optional<PropertyPrice> findLatestByPropertyIdBeforeDate(
        @Param("propertyId") Long propertyId,
        @Param("date") LocalDate date
    );
}
