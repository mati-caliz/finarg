package com.finarg.service;

import com.finarg.model.dto.AlertaRequestDTO;
import com.finarg.model.dto.AlertaResponseDTO;
import com.finarg.model.entity.Alerta;
import com.finarg.model.entity.User;
import com.finarg.repository.AlertaRepository;
import com.finarg.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlertaService {

    private final AlertaRepository alertaRepository;
    private final UserRepository userRepository;

    public List<AlertaResponseDTO> getAlertasByUserId(Long userId) {
        return alertaRepository.findByUserId(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public AlertaResponseDTO createAlerta(Long userId, AlertaRequestDTO request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Alerta alerta = Alerta.builder()
                .user(user)
                .tipo(request.getTipo())
                .condicion(request.getCondicion())
                .valorObjetivo(request.getValorObjetivo())
                .notificarEmail(request.isNotificarEmail())
                .notificarPush(request.isNotificarPush())
                .activa(true)
                .build();

        alerta = alertaRepository.save(alerta);
        log.info("Alerta creada: {} para usuario {}", alerta.getId(), userId);

        return mapToDTO(alerta);
    }

    public void deleteAlerta(Long alertaId, Long userId) {
        Alerta alerta = alertaRepository.findById(alertaId)
                .orElseThrow(() -> new RuntimeException("Alerta no encontrada"));

        if (!alerta.getUser().getId().equals(userId)) {
            throw new RuntimeException("No autorizado");
        }

        alertaRepository.delete(alerta);
        log.info("Alerta eliminada: {}", alertaId);
    }

    public AlertaResponseDTO toggleAlerta(Long alertaId, Long userId) {
        Alerta alerta = alertaRepository.findById(alertaId)
                .orElseThrow(() -> new RuntimeException("Alerta no encontrada"));

        if (!alerta.getUser().getId().equals(userId)) {
            throw new RuntimeException("No autorizado");
        }

        alerta.setActiva(!alerta.isActiva());
        alerta = alertaRepository.save(alerta);

        return mapToDTO(alerta);
    }

    public List<Alerta> getAlertasActivas() {
        return alertaRepository.findByActivaTrue();
    }

    private AlertaResponseDTO mapToDTO(Alerta alerta) {
        return AlertaResponseDTO.builder()
                .id(alerta.getId())
                .tipo(alerta.getTipo())
                .condicion(alerta.getCondicion())
                .valorObjetivo(alerta.getValorObjetivo())
                .activa(alerta.isActiva())
                .notificarEmail(alerta.isNotificarEmail())
                .notificarPush(alerta.isNotificarPush())
                .ultimaNotificacion(alerta.getUltimaNotificacion())
                .createdAt(alerta.getCreatedAt())
                .build();
    }
}
