package com.bodegon.club;

import com.bodegon.club.dto.auth.AuthenticationResponse;
import com.bodegon.club.dto.auth.RegisterRequest;
import com.bodegon.club.dto.redemption.RedemptionDto;
import com.bodegon.club.dto.reward.RewardDto;
import com.bodegon.club.entity.User;
import com.bodegon.club.repository.RewardRepository;
import com.bodegon.club.repository.UserRepository;
import com.bodegon.club.service.AuthService;
import com.bodegon.club.service.PointsService;
import com.bodegon.club.service.RewardService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
class RedemptionIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AuthService authService;

    @Autowired
    private RewardService rewardService;

    @Autowired
    private PointsService pointsService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RewardRepository rewardRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private String userToken;
    private User adminUser;

    @BeforeEach
    void setUp() {
        // Clean up or just create unique users per test if persistence is persistent
        // H2 in memory usually resets context but Spring Boot Test might cache context.
        // We use random emails to avoid conflict.
    }

    @Test
    void shouldRedeemRewardSuccessfully() throws Exception {
        // 1. Register User
        String email = "redeemer" + System.currentTimeMillis() + "@test.com";
        AuthenticationResponse auth = authService.register(new RegisterRequest("Redeemer", email, "pass123", null));
        userToken = "Bearer " + auth.getAccessToken();

        // 2. Create Reward (as Admin logic - but calling service directly for setup)
        RewardDto.Request rewardRequest = new RewardDto.Request();
        rewardRequest.setName("Free Beer");
        rewardRequest.setPointsCost(100);
        rewardRequest.setStock(10);
        rewardRequest.setValidFrom(LocalDateTime.now().minusDays(1));
        rewardRequest.setValidTo(LocalDateTime.now().plusDays(10));

        var reward = rewardService.createReward(rewardRequest);

        // 3. Earn Points (simulate admin adding points)
        // Need ID of user.
        var user = userRepository.findByEmail(email).get();
        // Since we didn't implement getProfile in test util, let's fetch ID.

        // Admin user for points adjustment
        User admin = User.builder().email("admin-test@test.com").fullName("Admin").passwordHash("hash")
                .role(com.bodegon.club.entity.enums.Role.ADMIN).build();
        userRepository.save(admin); // Just to have an ID reference if needed by audit

        // Add 200 points
        pointsService.earnPoints(user.getId(), 200, com.bodegon.club.entity.enums.TransactionSource.PURCHASE,
                "Test Purchase", admin);

        // 4. Redeem
        RedemptionDto.Request redeemRequest = new RedemptionDto.Request(reward.getId());

        mockMvc.perform(post("/api/redemptions")
                .header("Authorization", userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(redeemRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", notNullValue()))
                .andExpect(jsonPath("$.status", is("ISSUED")));
    }
}
