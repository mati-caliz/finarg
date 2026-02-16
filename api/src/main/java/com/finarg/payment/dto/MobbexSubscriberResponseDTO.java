package com.finarg.payment.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class MobbexSubscriberResponseDTO {

    @JsonProperty("result")
    private Boolean result;

    @JsonProperty("data")
    private SubscriberDataDTO data;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class SubscriberDataDTO {

        @JsonProperty("subscriber")
        private SubscriberDTO subscriber;

        @JsonProperty("sourceUrl")
        private String sourceUrl;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class SubscriberDTO {

        @JsonProperty("uid")
        private String uid;

        @JsonProperty("status")
        private Integer status;
    }
}
