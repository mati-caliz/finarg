package com.finarg.service;

import com.finarg.model.dto.AlertRequestDTO;
import com.finarg.model.dto.AlertResponseDTO;
import com.finarg.model.entity.Alert;
import com.finarg.model.entity.User;
import com.finarg.repository.AlertRepository;
import com.finarg.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepository;
    private final UserRepository userRepository;

    public List<AlertResponseDTO> getAlertsByUserId(Long userId) {
        return alertRepository.findByUserId(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public AlertResponseDTO createAlert(Long userId, AlertRequestDTO request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Alert alert = Alert.builder()
                .user(user)
                .type(request.getType())
                .condition(request.getCondition())
                .targetValue(request.getTargetValue())
                .emailNotification(request.isEmailNotification())
                .pushNotification(request.isPushNotification())
                .active(true)
                .build();

        alert = alertRepository.save(alert);
        log.info("Alert created: {} for user {}", alert.getId(), userId);

        return mapToDTO(alert);
    }

    public void deleteAlert(Long alertId, Long userId) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found"));

        if (!alert.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        alertRepository.delete(alert);
        log.info("Alert deleted: {}", alertId);
    }

    public AlertResponseDTO toggleAlert(Long alertId, Long userId) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found"));

        if (!alert.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        alert.setActive(!alert.isActive());
        alert = alertRepository.save(alert);

        return mapToDTO(alert);
    }

    public List<Alert> getActiveAlerts() {
        return alertRepository.findByActiveTrue();
    }

    private AlertResponseDTO mapToDTO(Alert alert) {
        return AlertResponseDTO.builder()
                .id(alert.getId())
                .type(alert.getType())
                .condition(alert.getCondition())
                .targetValue(alert.getTargetValue())
                .active(alert.isActive())
                .emailNotification(alert.isEmailNotification())
                .pushNotification(alert.isPushNotification())
                .lastNotification(alert.getLastNotification())
                .createdAt(alert.getCreatedAt())
                .build();
    }
}
