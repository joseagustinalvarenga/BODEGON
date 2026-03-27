package com.bodegon.club.controller;

import com.bodegon.club.dto.promotion.PromotionDto;
import com.bodegon.club.service.PromotionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/promotions")
@RequiredArgsConstructor
public class PromotionController {

    private final PromotionService promotionService;

    @GetMapping("/public")
    public ResponseEntity<List<PromotionDto.Response>> getPublicPromotions() {
        return ResponseEntity.ok(promotionService.getAccessablePromotions(false));
    }

    @GetMapping
    public ResponseEntity<List<PromotionDto.Response>> getPromotionsForMember(Authentication authentication) {
        boolean isMember = authentication != null && authentication.isAuthenticated();
        return ResponseEntity.ok(promotionService.getAccessablePromotions(isMember));
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
            @PathVariable java.util.UUID id,
            @RequestBody @Valid PromotionDto.Request request) {
        return ResponseEntity.ok(promotionService.updatePromotion(id, request));
    }
}
