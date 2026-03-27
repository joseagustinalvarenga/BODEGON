package com.bodegon.club.controller;

import com.bodegon.club.dto.reward.RewardDto;
import com.bodegon.club.service.RewardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rewards")
@RequiredArgsConstructor
public class RewardController {

    private final RewardService rewardService;

    @GetMapping
    public ResponseEntity<List<RewardDto.Response>> getActiveRewards() {
        return ResponseEntity.ok(rewardService.getActiveRewards());
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RewardDto.Response>> getAllRewards() {
        return ResponseEntity.ok(rewardService.getAllRewards());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RewardDto.Response> createReward(@RequestBody @Valid RewardDto.Request request) {
        return ResponseEntity.ok(rewardService.createReward(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RewardDto.Response> updateReward(
            @PathVariable UUID id,
            @RequestBody @Valid RewardDto.Request request) {
        return ResponseEntity.ok(rewardService.updateReward(id, request));
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RewardDto.Response> toggleReward(@PathVariable UUID id) {
        return ResponseEntity.ok(rewardService.toggleReward(id));
    }
}
