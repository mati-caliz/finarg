package com.finarg.repository;

import com.finarg.model.entity.CotizacionHistorica;
import com.finarg.model.enums.TipoDolar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CotizacionHistoricaRepository extends JpaRepository<CotizacionHistorica, Long> {
    
    List<CotizacionHistorica> findByTipoAndFechaBetweenOrderByFechaAsc(
            TipoDolar tipo, LocalDate fechaInicio, LocalDate fechaFin);
    
    Optional<CotizacionHistorica> findByTipoAndFecha(TipoDolar tipo, LocalDate fecha);
    
    @Query("SELECT c FROM CotizacionHistorica c WHERE c.tipo = :tipo ORDER BY c.fecha DESC LIMIT 1")
    Optional<CotizacionHistorica> findLatestByTipo(TipoDolar tipo);
    
    @Query("SELECT c FROM CotizacionHistorica c WHERE c.fecha = :fecha")
    List<CotizacionHistorica> findAllByFecha(LocalDate fecha);
    
    boolean existsByTipoAndFecha(TipoDolar tipo, LocalDate fecha);
}
