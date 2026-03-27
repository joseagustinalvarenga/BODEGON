package com.bodegon.club.dto.redemption;

import com.bodegon.club.entity.enums.RedemptionStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

public class RedemptionDto {

    @Data
    @Builder
    public static class Response {
        private UUID id;
        private String code;
        private String rewardName;
        private Integer pointsSpent;
        private RedemptionStatus status;
        private LocalDateTime issuedAt;
        private LocalDateTime expiresAt;
    }

    @Data
    @Builder
    public static class AdminResponse {
        private UUID id;
        private String code;
        private String memberName;
        private String memberEmail;
        private String rewardName;
        private Integer pointsSpent;
        private RedemptionStatus status;
        private LocalDateTime issuedAt;
        private LocalDateTime expiresAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        @NotNull
        private UUID rewardId;
    }
}
