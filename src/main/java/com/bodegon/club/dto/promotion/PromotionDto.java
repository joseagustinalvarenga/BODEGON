package com.bodegon.club.dto.promotion;

import com.bodegon.club.entity.enums.PromotionStatus;
import com.bodegon.club.entity.enums.PromotionType;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

public class PromotionDto {

    @Data
    @Builder
    public static class Response {
        private UUID id;
        private String title;
        private String description;
        private PromotionType type;
        private PromotionStatus status;
        private LocalDateTime startAt;
        private LocalDateTime endAt;
        private String imageUrl;
        private String discountType;
        private Double discountValue;
    }

    @Data
    public static class Request {
        @NotBlank
        private String title;
        private String description;
        @NotNull
        private PromotionType type;
        @NotNull
        private LocalDateTime startAt;
        @NotNull
        @Future
        private LocalDateTime endAt;
        private String imageUrl;
        private String discountType;
        private Double discountValue;
    }
}
