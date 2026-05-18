package com.bodegon.club.controller;

import com.bodegon.club.dto.reward.RewardDto;
import com.bodegon.club.entity.enums.MemberLevel;
import com.bodegon.club.service.MemberService;
import com.bodegon.club.service.RewardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rewards")
@RequiredArgsConstructor
public class RewardController {

    private final RewardService rewardService;
    private final MemberService memberService;

    /** Miembro autenticado: ve solo las recompensas de su nivel o superior */
    @GetMapping
    public ResponseEntity<List<RewardDto.Response>> getActiveRewards(Authentication authentication) {
        MemberLevel level = authentication != null
                ? memberService.getMemberLevel(authentication.getName())
                : MemberLevel.BRONZE;
        return ResponseEntity.ok(rewardService.getActiveRewards(level));
    }

    /** Público: cualquiera puede ver todas las recompensas activas (para promocionar el club) */
    @GetMapping("/public")
    public ResponseEntity<List<RewardDto.Response>> getPublicActiveRewards() {
        return ResponseEntity.ok(rewardService.getPublicActiveRewards());
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
