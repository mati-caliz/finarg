package com.finarg.alerts.service;

import com.finarg.core.exception.AlertNotFoundException;
import com.finarg.core.exception.UserNotFoundException;
import com.finarg.alerts.dto.AlertRequestDTO;
import com.finarg.alerts.dto.AlertResponseDTO;
import com.finarg.alerts.entity.Alert;
import com.finarg.user.entity.User;
import com.finarg.alerts.repository.AlertRepository;
import com.finarg.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import org.springframework.security.access.AccessDeniedException;

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
                .orElseThrow(UserNotFoundException::new);

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
                .orElseThrow(AlertNotFoundException::new);

        if (!alert.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Access denied");
        }

        alertRepository.delete(alert);
    }

    public AlertResponseDTO toggleAlert(Long alertId, Long userId) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(AlertNotFoundException::new);

        if (!alert.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Access denied");
        }

        alert.setActive(!alert.isActive());
        alert = alertRepository.save(alert);

        return mapToDTO(alert);
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
