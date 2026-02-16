package com.finarg.payment.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MobbexSubscriberRequestDTO {

    @JsonProperty("customer")
    private CustomerDTO customer;

    @Getter
    @Builder
    public static class CustomerDTO {

        @JsonProperty("name")
        private String name;

        @JsonProperty("email")
        private String email;

        @JsonProperty("identification")
        private String identification;

        @JsonProperty("phone")
        private String phone;
    }
}
