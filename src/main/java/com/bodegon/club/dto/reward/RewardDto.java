package com.bodegon.club.dto.reward;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

public class RewardDto {

    @Data
    @Builder
    public static class Response {
        private UUID id;
        private String name;
        private String description;
        private Integer pointsCost;
        private Integer stock;
        private Boolean active;
        private LocalDateTime validFrom;
        private LocalDateTime validTo;
    }

    @Data
    public static class Request {
        @NotBlank
        private String name;
        private String description;
        @NotNull
        @Min(1)
        private Integer pointsCost;
        private Integer stock;
        private LocalDateTime validFrom;
        private LocalDateTime validTo;
    }
}
