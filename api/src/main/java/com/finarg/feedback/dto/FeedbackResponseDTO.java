package com.finarg.feedback.dto;

import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackResponseDTO implements Serializable {
    private Long id;
    private Integer rating;
    private String comment;
    private String email;
    private String url;
    private LocalDateTime timestamp;
    private LocalDateTime createdAt;
}
