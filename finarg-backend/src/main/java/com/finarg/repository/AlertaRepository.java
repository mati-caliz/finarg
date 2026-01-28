package com.finarg.repository;

import com.finarg.model.entity.Alerta;
import com.finarg.model.enums.TipoAlerta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertaRepository extends JpaRepository<Alerta, Long> {
    List<Alerta> findByUserId(Long userId);
    List<Alerta> findByUserIdAndActiva(Long userId, boolean activa);
    List<Alerta> findByTipoAndActiva(TipoAlerta tipo, boolean activa);
    List<Alerta> findByActivaTrue();
}
