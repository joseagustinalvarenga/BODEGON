package com.bodegon.club.controller;

import com.bodegon.club.dto.promotion.PromotionDto;
import com.bodegon.club.entity.enums.MemberLevel;
import com.bodegon.club.service.MemberService;
import com.bodegon.club.service.PromotionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/promotions")
@RequiredArgsConstructor
public class PromotionController {

    private final PromotionService promotionService;
    private final MemberService memberService;

    @GetMapping("/public")
    public ResponseEntity<List<PromotionDto.Response>> getPublicPromotions() {
        return ResponseEntity.ok(promotionService.getAccessablePromotions(null));
    }

    @GetMapping
    public ResponseEntity<List<PromotionDto.Response>> getPromotionsForMember(Authentication authentication) {
        MemberLevel level = (authentication != null && authentication.isAuthenticated())
                ? memberService.getMemberLevel(authentication.getName())
                : null;
        return ResponseEntity.ok(promotionService.getAccessablePromotions(level));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PromotionDto.Response> createPromotion(
            @RequestBody @Valid PromotionDto.Request request,
            Authentication authentication) {
        return ResponseEntity.ok(promotionService.createPromotion(request, authentication.getName()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PromotionDto.Response> updatePromotion(
            @PathVariable UUID id,
            @RequestBody @Valid PromotionDto.Request request) {
        return ResponseEntity.ok(promotionService.updatePromotion(id, request));
    }
}
