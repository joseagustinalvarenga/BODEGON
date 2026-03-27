package com.bodegon.club.controller;

import com.bodegon.club.dto.member.MemberDto;
import com.bodegon.club.dto.redemption.RedemptionDto;
import com.bodegon.club.service.MemberService;
import com.bodegon.club.service.RedemptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;
    private final RedemptionService redemptionService;

    @GetMapping("/me")
    public ResponseEntity<MemberDto.Response> getMyProfile(Authentication authentication) {
        return ResponseEntity.ok(memberService.getMemberProfile(authentication.getName()));
    }

    @PutMapping("/me")
    public ResponseEntity<MemberDto.Response> updateProfile(
            @RequestBody MemberDto.UpdateRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(memberService.updateProfile(authentication.getName(), request));
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> changePassword(
            @RequestBody MemberDto.ChangePasswordRequest request,
            Authentication authentication) {
        memberService.changePassword(authentication.getName(), request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me/transactions")
    public ResponseEntity<Page<MemberDto.TransactionResponse>> getMyTransactions(
            Authentication authentication,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(memberService.getMyTransactions(authentication.getName(), pageable));
    }

    @GetMapping("/me/redemptions")
    public ResponseEntity<List<RedemptionDto.Response>> getMyRedemptions(Authentication authentication) {
        return ResponseEntity.ok(redemptionService.getMemberRedemptions(authentication.getName()));
    }
}
