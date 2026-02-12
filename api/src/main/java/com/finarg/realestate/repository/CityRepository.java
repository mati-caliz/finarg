package com.finarg.realestate.repository;

import com.finarg.realestate.entity.City;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CityRepository extends JpaRepository<City, Long> {

    Optional<City> findByCode(String code);

    List<City> findByIsActiveTrue();

}
