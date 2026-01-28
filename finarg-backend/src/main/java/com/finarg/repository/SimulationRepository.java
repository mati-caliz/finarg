package com.finarg.repository;

import com.finarg.model.entity.Simulation;
import com.finarg.model.enums.InvestmentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SimulationRepository extends JpaRepository<Simulation, Long> {
    List<Simulation> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Simulation> findByUserIdAndInvestmentType(Long userId, InvestmentType investmentType);
}
