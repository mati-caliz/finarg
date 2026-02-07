package com.finarg.repository;

import com.finarg.model.entity.Alert;
import com.finarg.model.enums.AlertType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByUserId(Long userId);
    List<Alert> findByUserIdAndActive(Long userId, boolean active);
    List<Alert> findByTypeAndActive(AlertType type, boolean active);
    List<Alert> findByActiveTrue();
}
