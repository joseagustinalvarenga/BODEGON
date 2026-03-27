package com.bodegon.club;

import com.bodegon.club.dto.auth.AuthenticationRequest;
import com.bodegon.club.dto.auth.RegisterRequest;
import com.bodegon.club.dto.reward.RewardDto;
import com.bodegon.club.entity.enums.Role;
import com.bodegon.club.entity.enums.TransactionSource;
import com.bodegon.club.repository.MemberProfileRepository;
import com.bodegon.club.repository.UserRepository;
import java.util.UUID;
import com.bodegon.club.service.AuthService;
import com.bodegon.club.service.PointsService;
import com.bodegon.club.service.RewardService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;


import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
@DisplayName("Tests de integración — Panel Admin")
class AdminIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private AuthService authService;
    @Autowired private UserRepository userRepository;
    @Autowired private MemberProfileRepository memberProfileRepository;
    @Autowired private RewardService rewardService;
    @Autowired private PointsService pointsService;
    @Autowired private ObjectMapper objectMapper;

    private String adminToken;
    private String memberToken;
    private String memberId;      // MemberProfile UUID (lo que espera la API)

    @BeforeEach
    void setUp() {
        long ts = System.currentTimeMillis();

        // 1. Registrar usuario admin y cambiar rol a ADMIN
        String adminEmail = "admin_" + ts + "@test.com";
        authService.register(new RegisterRequest("Admin Test", adminEmail, "Admin1234", null));
        var adminUser = userRepository.findByEmail(adminEmail).orElseThrow();
        adminUser.setRole(Role.ADMIN);
        userRepository.save(adminUser);
        // Re-autenticar para obtener token con rol ADMIN
        var adminAuth = authService.authenticate(new AuthenticationRequest(adminEmail, "Admin1234"));
        adminToken = "Bearer " + adminAuth.getAccessToken();

        // 2. Registrar miembro normal
        String memberEmail = "member_" + ts + "@test.com";
        var memberAuth = authService.register(new RegisterRequest("Member Test", memberEmail, "Member1234", null));
        memberToken = "Bearer " + memberAuth.getAccessToken();
        UUID memberUserId = userRepository.findByEmail(memberEmail).orElseThrow().getId();
        memberId = memberProfileRepository.findByUserId(memberUserId).orElseThrow().getId().toString();
    }

    // =============================================
    // GESTIÓN DE MIEMBROS
    // =============================================

    @Test
    @DisplayName("Admin puede ver la lista de todos los miembros")
    void adminPuedeVerListaDeMiembros() throws Exception {
        mockMvc.perform(get("/api/admin/members")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())));
    }

    @Test
    @DisplayName("Admin puede ajustar puntos de un miembro (sumar)")
    void adminPuedeAjustarPuntosPositivos() throws Exception {
        var body = Map.of("points", 500, "description", "Bono por cumpleaños");

        mockMvc.perform(post("/api/admin/members/" + memberId + "/points")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Admin puede ajustar puntos de un miembro (restar)")
    void adminPuedeAjustarPuntosNegativos() throws Exception {
        // Primero damos puntos al miembro
        var adminUser = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ADMIN).findFirst().orElseThrow();
        pointsService.earnPoints(UUID.fromString(memberId), 300, TransactionSource.PURCHASE, "Puntos iniciales", adminUser);

        var body = Map.of("points", -100, "description", "Ajuste manual");

        mockMvc.perform(post("/api/admin/members/" + memberId + "/points")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Admin puede ver las estadísticas generales")
    void adminPuedeVerEstadisticas() throws Exception {
        mockMvc.perform(get("/api/admin/stats")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalMembers", notNullValue()));
    }

    // =============================================
    // GESTIÓN DE RECOMPENSAS
    // =============================================

    @Test
    @DisplayName("Admin puede crear una nueva recompensa")
    void adminPuedeCrearRecompensa() throws Exception {
        var body = Map.of(
                "name", "Empanada gratis",
                "description", "Una empanada de regalo",
                "pointsCost", 200,
                "stock", 50
        );

        mockMvc.perform(post("/api/rewards")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.name", is("Empanada gratis")))
                .andExpect(jsonPath("$.pointsCost", is(200)))
                .andExpect(jsonPath("$.active", is(true)));
    }

    @Test
    @DisplayName("Admin puede ver todas las recompensas (activas e inactivas)")
    void adminPuedeVerTodasLasRecompensas() throws Exception {
        // Crear una recompensa
        RewardDto.Request req = new RewardDto.Request();
        req.setName("Reward visible admin");
        req.setPointsCost(100);
        rewardService.createReward(req);

        mockMvc.perform(get("/api/rewards/all")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())));
    }

    @Test
    @DisplayName("Admin puede editar una recompensa existente")
    void adminPuedeEditarRecompensa() throws Exception {
        RewardDto.Request req = new RewardDto.Request();
        req.setName("Recompensa original");
        req.setPointsCost(150);
        var reward = rewardService.createReward(req);

        var updateBody = Map.of(
                "name", "Recompensa actualizada",
                "pointsCost", 180,
                "description", "Descripción nueva"
        );

        mockMvc.perform(put("/api/rewards/" + reward.getId())
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Recompensa actualizada")))
                .andExpect(jsonPath("$.pointsCost", is(180)));
    }

    @Test
    @DisplayName("Admin puede activar/desactivar una recompensa")
    void adminPuedeToggleRecompensa() throws Exception {
        RewardDto.Request req = new RewardDto.Request();
        req.setName("Recompensa toggle");
        req.setPointsCost(100);
        var reward = rewardService.createReward(req); // activa por defecto

        // Desactivar
        mockMvc.perform(patch("/api/rewards/" + reward.getId() + "/toggle")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active", is(false)));

        // Volver a activar
        mockMvc.perform(patch("/api/rewards/" + reward.getId() + "/toggle")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active", is(true)));
    }

    @Test
    @DisplayName("Admin no puede crear recompensa sin nombre (validación)")
    void adminNoPuedeCrearRecompensaSinNombre() throws Exception {
        var body = Map.of("pointsCost", 100);

        mockMvc.perform(post("/api/rewards")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().is4xxClientError());
    }

    // =============================================
    // GESTIÓN DE CANJES
    // =============================================

    @Test
    @DisplayName("Admin puede ver los canjes pendientes de validación")
    void adminPuedeVerCanjesPendientes() throws Exception {
        mockMvc.perform(get("/api/admin/redemptions")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", instanceOf(java.util.List.class)));
    }

    // =============================================
    // SEGURIDAD — Un miembro NO puede acceder al panel admin
    // =============================================

    @Test
    @DisplayName("Miembro NO puede ver la lista de miembros (403)")
    void miembroNoPuedeVerListaDeMiembros() throws Exception {
        mockMvc.perform(get("/api/admin/members")
                        .header("Authorization", memberToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Miembro NO puede ajustar puntos de otro usuario (403)")
    void miembroNoPuedeAjustarPuntos() throws Exception {
        var body = Map.of("points", 999, "description", "Hack");

        mockMvc.perform(post("/api/admin/members/" + memberId + "/points")
                        .header("Authorization", memberToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Miembro NO puede crear recompensas (403)")
    void miembroNoPuedeCrearRecompensas() throws Exception {
        var body = Map.of("name", "Fraude", "pointsCost", 1);

        mockMvc.perform(post("/api/rewards")
                        .header("Authorization", memberToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Solicitud sin token no puede acceder a ningún endpoint protegido (401/403)")
    void sinTokenNoPuedeAcceder() throws Exception {
        mockMvc.perform(get("/api/admin/members"))
                .andExpect(status().is4xxClientError());
    }
}
