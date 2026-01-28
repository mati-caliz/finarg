package com.finarg.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Async
    public void sendEmail(String to, String subject, String body) {
        if (fromEmail == null || fromEmail.isEmpty()) {
            log.warn("Email no configurado, notificacion no enviada");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("[FinArg] " + subject);
            message.setText(body);
            
            mailSender.send(message);
            log.info("Email enviado a: {}", to);
        } catch (Exception e) {
            log.error("Error enviando email a {}: {}", to, e.getMessage());
        }
    }

    public void sendArbitrajeAlert(String email, String oportunidad, String gananciaEstimada) {
        String subject = "Oportunidad de Arbitraje Detectada";
        String body = String.format("""
                Hola!
                
                Se detecto una oportunidad de arbitraje:
                
                %s
                
                Ganancia estimada: %s USD por cada 1000 USD
                
                Ingresa a FinArg para mas detalles.
                
                Saludos,
                El equipo de FinArg
                """, oportunidad, gananciaEstimada);

        sendEmail(email, subject, body);
    }

    public void sendBrechaAlert(String email, String nivelBrecha, String porcentaje) {
        String subject = "Alerta de Brecha Cambiaria";
        String body = String.format("""
                Hola!
                
                La brecha cambiaria cambio a nivel: %s
                
                Brecha actual: %s%%
                
                Ingresa a FinArg para mas detalles.
                
                Saludos,
                El equipo de FinArg
                """, nivelBrecha, porcentaje);

        sendEmail(email, subject, body);
    }
}
