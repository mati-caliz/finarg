package com.finarg.realestate.repository;

import com.finarg.realestate.entity.Neighborhood;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NeighborhoodRepository extends JpaRepository<Neighborhood, Long> {

    Optional<Neighborhood> findByCode(String code);

    Optional<Neighborhood> findByCodeAndCityId(String code, Long cityId);

    List<Neighborhood> findByCityIdAndIsActiveTrue(Long cityId);

    List<Neighborhood> findByIsActiveTrue();
}
