package com.bodegon.club.dto.admin;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

public class AdminDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PurchaseRequest {
        @NotBlank
        private String dni;
        private String fullName; // required only when creating a new account
        @NotNull
        @Min(1)
        private Long amount; // amount in pesos
    }

    @Data
    @Builder
    public static class PurchaseResponse {
        private UUID memberId;
        private String fullName;
        private String dni;
        private int pointsEarned;
        private int currentPoints;
        private boolean newAccount;
    }
}
