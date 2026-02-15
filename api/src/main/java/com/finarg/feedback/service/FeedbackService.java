package com.finarg.feedback.service;

import com.finarg.feedback.dto.FeedbackRequestDTO;
import com.finarg.feedback.dto.FeedbackResponseDTO;
import com.finarg.feedback.entity.Feedback;
import com.finarg.feedback.repository.FeedbackRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;

    private JavaMailSender mailSender;

    @Value("${mail.username:}")
    private String mailFrom;

    @Value("${feedback.notification.email:}")
    private String feedbackNotificationEmail;

    public FeedbackService(FeedbackRepository feedbackRepository) {
        this.feedbackRepository = feedbackRepository;
    }

    @Autowired(required = false)
    public void setMailSender(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public FeedbackResponseDTO saveFeedback(FeedbackRequestDTO request) {
        Feedback feedback = Feedback.builder()
                .rating(request.getRating())
                .comment(request.getComment())
                .email(request.getEmail())
                .url(request.getUrl())
                .timestamp(request.getTimestamp())
                .build();

        feedback = feedbackRepository.save(feedback);
        log.info("Feedback saved: ID={}, Rating={}, URL={}", feedback.getId(), feedback.getRating(), feedback.getUrl());

        sendEmailNotification(feedback);

        return mapToDTO(feedback);
    }

    public List<FeedbackResponseDTO> getAllFeedback() {
        return feedbackRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<FeedbackResponseDTO> getFeedbackByRating(Integer rating) {
        return feedbackRepository.findByRatingOrderByCreatedAtDesc(rating).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private void sendEmailNotification(Feedback feedback) {
        if (mailSender == null) {
            log.debug("Mail sender not configured - skipping email notification");
            return;
        }

        if (feedbackNotificationEmail == null || feedbackNotificationEmail.isBlank()) {
            log.debug("Feedback email notification disabled (no recipient configured)");
            return;
        }

        if (mailFrom == null || mailFrom.isBlank()) {
            log.warn("Cannot send feedback notification: mail.username not configured");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailFrom);
            message.setTo(feedbackNotificationEmail);
            message.setSubject(String.format("New Feedback: %d stars", feedback.getRating()));

            StringBuilder body = new StringBuilder();
            body.append("New feedback received\n\n");
            body.append("Rating: ").append(feedback.getRating()).append(" stars\n");
            body.append("URL: ").append(feedback.getUrl()).append("\n");
            body.append("Timestamp: ").append(feedback.getTimestamp()).append("\n\n");

            if (feedback.getComment() != null && !feedback.getComment().isBlank()) {
                body.append("Comment:\n").append(feedback.getComment()).append("\n\n");
            }

            if (feedback.getEmail() != null && !feedback.getEmail().isBlank()) {
                body.append("User email: ").append(feedback.getEmail()).append("\n");
            }

            message.setText(body.toString());
            mailSender.send(message);

            log.info("Feedback notification email sent to {}", feedbackNotificationEmail);
        } catch (Exception e) {
            log.error("Failed to send feedback notification email", e);
        }
    }

    private FeedbackResponseDTO mapToDTO(Feedback feedback) {
        return FeedbackResponseDTO.builder()
                .id(feedback.getId())
                .rating(feedback.getRating())
                .comment(feedback.getComment())
                .email(feedback.getEmail())
                .url(feedback.getUrl())
                .timestamp(feedback.getTimestamp())
                .createdAt(feedback.getCreatedAt())
                .build();
    }
}
