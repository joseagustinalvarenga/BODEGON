package com.bodegon.club.controller;

import com.bodegon.club.dto.admin.AdminDto;
import com.bodegon.club.dto.member.MemberDto;
import com.bodegon.club.dto.redemption.RedemptionDto;
import com.bodegon.club.entity.User;
import com.bodegon.club.repository.UserRepository;
import com.bodegon.club.service.MemberService;
import com.bodegon.club.service.PointsService;
import com.bodegon.club.service.RedemptionService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final MemberService memberService;
    private final RedemptionService redemptionService;
    private final PointsService pointsService;
    private final UserRepository userRepository;

    @GetMapping("/members")
    public ResponseEntity<List<MemberDto.Response>> getAllMembers() {
        return ResponseEntity.ok(memberService.getAllMembers());
    }

    @PostMapping("/members/{memberId}/points")
    public ResponseEntity<Void> adjustPoints(
            @PathVariable UUID memberId,
            @RequestBody AdjustPointsRequest request,
            Authentication authentication) {
        User admin = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        pointsService.adjustPoints(memberId, request.getPoints(), request.getDescription(), admin);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/redemptions")
    public ResponseEntity<List<RedemptionDto.AdminResponse>> getIssuedRedemptions() {
        return ResponseEntity.ok(redemptionService.getIssuedRedemptions());
    }

    @PostMapping("/redemptions/validate/{code}")
    public ResponseEntity<RedemptionDto.Response> validateRedemption(
            @PathVariable String code,
            Authentication authentication) {
        User admin = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        return ResponseEntity.ok(redemptionService.validateRedemption(code, admin.getId()));
    }

    @GetMapping("/members/search")
    public ResponseEntity<MemberDto.Response> searchByDni(@RequestParam String dni) {
        return memberService.findByDni(dni)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/purchase")
    public ResponseEntity<AdminDto.PurchaseResponse> registerPurchase(
            @RequestBody @Valid AdminDto.PurchaseRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(memberService.registerPurchase(request, authentication.getName()));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(memberService.getStats());
    }

    @Data
    static class AdjustPointsRequest {
        private int points;
        @NotBlank
        private String description;
    }
}
