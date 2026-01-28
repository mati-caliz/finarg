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
            log.warn("Email not configured, notification not sent");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("[FinLatam] " + subject);
            message.setText(body);
            
            mailSender.send(message);
            log.info("Email sent to: {}", to);
        } catch (Exception e) {
            log.error("Error sending email to {}: {}", to, e.getMessage());
        }
    }

    public void sendArbitrageAlert(String email, String opportunity, String estimatedProfit) {
        String subject = "Arbitrage Opportunity Detected";
        String body = String.format("""
                Hello!
                
                An arbitrage opportunity has been detected:
                
                %s
                
                Estimated profit: %s USD per 1000 USD
                
                Log in to FinLatam for more details.
                
                Best regards,
                The FinLatam Team
                """, opportunity, estimatedProfit);

        sendEmail(email, subject, body);
    }

    public void sendGapAlert(String email, String gapLevel, String percentage) {
        String subject = "Exchange Gap Alert";
        String body = String.format("""
                Hello!
                
                The exchange gap has changed to level: %s
                
                Current gap: %s%%
                
                Log in to FinLatam for more details.
                
                Best regards,
                The FinLatam Team
                """, gapLevel, percentage);

        sendEmail(email, subject, body);
    }
}
