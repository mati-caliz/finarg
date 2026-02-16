package com.finarg.payment.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class MobbexWebhookRequestDTO {

    @NotBlank
    @JsonProperty("id")
    private String id;

    @NotBlank
    @JsonProperty("type")
    private String type;

    @JsonProperty("data")
    private WebhookDataDTO data;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class WebhookDataDTO {

        @JsonProperty("subscriber")
        private SubscriberDTO subscriber;

        @JsonProperty("execution")
        private ExecutionDTO execution;

        @JsonProperty("payment")
        private PaymentDTO payment;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class SubscriberDTO {

        @JsonProperty("uid")
        private String uid;

        @JsonProperty("customer")
        private CustomerDTO customer;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CustomerDTO {

        @JsonProperty("email")
        private String email;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ExecutionDTO {

        @JsonProperty("uid")
        private String uid;

        @JsonProperty("status")
        private Integer status;

        @JsonProperty("total")
        private Double total;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class PaymentDTO {

        @JsonProperty("status")
        private StatusDTO status;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class StatusDTO {

        @JsonProperty("code")
        private String code;

        @JsonProperty("text")
        private String text;
    }
}
