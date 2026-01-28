package com.finarg.repository;

import com.finarg.model.entity.Simulacion;
import com.finarg.model.enums.TipoInversion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SimulacionRepository extends JpaRepository<Simulacion, Long> {
    List<Simulacion> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Simulacion> findByUserIdAndTipoInversion(Long userId, TipoInversion tipoInversion);
}
