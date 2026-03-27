package com.bodegon.club.controller;

import com.bodegon.club.dto.redemption.RedemptionDto;
import com.bodegon.club.entity.User;
import com.bodegon.club.repository.UserRepository;
import com.bodegon.club.service.RedemptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/redemptions")
@RequiredArgsConstructor
public class RedemptionController {

    private final RedemptionService redemptionService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<RedemptionDto.Response> redeemReward(
            @RequestBody @Valid RedemptionDto.Request request,
            Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(redemptionService.redeemReward(user.getId(), request.getRewardId()));
    }
}
