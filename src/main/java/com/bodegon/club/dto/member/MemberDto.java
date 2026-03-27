package com.bodegon.club.dto.member;

import com.bodegon.club.entity.enums.MemberLevel;
import com.bodegon.club.entity.enums.Role;
import com.bodegon.club.entity.enums.UserStatus;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class MemberDto {

    @Data
    @Builder
    public static class Response {
        private UUID userId;
        private UUID memberId;
        private String fullName;
        private String email;
        private String phone;
        private Role role;
        private UserStatus status;
        private MemberLevel level;
        private Integer currentPoints;
        private Integer totalPointsEarned;
        private Integer totalVisits;
        private LocalDate birthDate;
        private LocalDateTime memberSince;
    }

    @Data
    @Builder
    public static class TransactionResponse {
        private UUID id;
        private String type;
        private String source;
        private Integer points;
        private String description;
        private String createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        private String fullName;
        private String phone;
        private LocalDate birthDate;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChangePasswordRequest {
        private String currentPassword;
        private String newPassword;
    }
}
