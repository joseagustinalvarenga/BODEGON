package com.bodegon.club;

import com.bodegon.club.dto.auth.RegisterRequest;
import com.bodegon.club.dto.reward.RewardDto;
import com.bodegon.club.entity.enums.Role;
import com.bodegon.club.entity.enums.TransactionSource;
import com.bodegon.club.repository.MemberProfileRepository;
import com.bodegon.club.repository.UserRepository;
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
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("local")
@DisplayName("Tests de integración — Panel Miembro")
class MemberIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private AuthService authService;
    @Autowired private UserRepository userRepository;
    @Autowired private MemberProfileRepository memberProfileRepository;
    @Autowired private RewardService rewardService;
    @Autowired private PointsService pointsService;
    @Autowired private ObjectMapper objectMapper;

    private String memberToken;
    private UUID memberUserId;
    private UUID memberProfileId;
    private UUID rewardId;
    private long ts;

    @BeforeEach
    void setUp() {
        ts = System.currentTimeMillis();

        // Registrar miembro
        String memberEmail = "miembro_" + ts + "@test.com";
        var memberAuth = authService.register(new RegisterRequest("Juan Pérez", memberEmail, "Miembro1234", null));
        memberToken = "Bearer " + memberAuth.getAccessToken();
        memberUserId = userRepository.findByEmail(memberEmail).orElseThrow().getId();
        memberProfileId = memberProfileRepository.findByUserId(memberUserId).orElseThrow().getId();

        // Crear admin para poder dar puntos en los tests
        String adminEmail = "admin_aux_" + ts + "@test.com";
        authService.register(new RegisterRequest("Admin Aux", adminEmail, "Admin1234", null));
        var adminUser = userRepository.findByEmail(adminEmail).orElseThrow();
        adminUser.setRole(Role.ADMIN);
        userRepository.save(adminUser);

        // Crear recompensa de prueba (100 pts)
        RewardDto.Request req = new RewardDto.Request();
        req.setName("Café gratis");
        req.setPointsCost(100);
        req.setStock(10);
        rewardId = rewardService.createReward(req).getId();
    }

    // =============================================
    // PERFIL
    // =============================================

    @Test
    @DisplayName("Miembro puede ver su perfil")
    void miembroPuedeVerSuPerfil() throws Exception {
        mockMvc.perform(get("/api/members/me")
                        .header("Authorization", memberToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName", is("Juan Pérez")))
                .andExpect(jsonPath("$.currentPoints", notNullValue()));
    }

    @Test
    @DisplayName("Miembro puede actualizar su nombre y teléfono")
    void miembroPuedeActualizarPerfil() throws Exception {
        var body = Map.of("fullName", "Juan Carlos Pérez", "phone", "376" + (ts % 10000000L));

        mockMvc.perform(put("/api/members/me")
                        .header("Authorization", memberToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName", is("Juan Carlos Pérez")));
    }

    // =============================================
    // CONTRASEÑA
    // =============================================

    @Test
    @DisplayName("Miembro puede cambiar su contraseña con la contraseña actual correcta")
    void miembroPuedeCambiarContrasena() throws Exception {
        var body = Map.of(
                "currentPassword", "Miembro1234",
                "newPassword", "NuevaClave5678"
        );

        mockMvc.perform(put("/api/members/me/password")
                        .header("Authorization", memberToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Miembro NO puede cambiar contraseña si la actual es incorrecta")
    void miembroNoPuedeCambiarContrasenaConClaveErronea() throws Exception {
        var body = Map.of(
                "currentPassword", "ClaveEquivocada99",
                "newPassword", "NuevaClave5678"
        );

        mockMvc.perform(put("/api/members/me/password")
                        .header("Authorization", memberToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().is4xxClientError());
    }

    // =============================================
    // TRANSACCIONES
    // =============================================

    @Test
    @DisplayName("Miembro puede ver su historial de transacciones (vacío al inicio)")
    void miembroPuedeVerTransacciones() throws Exception {
        mockMvc.perform(get("/api/members/me/transactions")
                        .header("Authorization", memberToken)
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", notNullValue()))
                .andExpect(jsonPath("$.totalElements", notNullValue()));
    }

    @Test
    @DisplayName("Miembro ve sus transacciones después de recibir puntos")
    void miembroPuedeVerTransaccionesConPuntos() throws Exception {
        var adminUser = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ADMIN).findFirst().orElseThrow();
        pointsService.earnPoints(memberProfileId, 250, TransactionSource.PURCHASE, "Almuerzo del domingo", adminUser);

        mockMvc.perform(get("/api/members/me/transactions")
                        .header("Authorization", memberToken)
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", not(empty())))
                .andExpect(jsonPath("$.content[0].points", is(250)));
    }

    // =============================================
    // RECOMPENSAS
    // =============================================

    @Test
    @DisplayName("Miembro puede ver el catálogo de recompensas activas")
    void miembroPuedeVerRecompensas() throws Exception {
        mockMvc.perform(get("/api/rewards")
                        .header("Authorization", memberToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())));
    }

    @Test
    @DisplayName("Miembro NO puede ver el listado completo de recompensas (solo admin)")
    void miembroNoPuedeVerTodasLasRecompensas() throws Exception {
        mockMvc.perform(get("/api/rewards/all")
                        .header("Authorization", memberToken))
                .andExpect(status().isForbidden());
    }

    // =============================================
    // CANJES
    // =============================================

    @Test
    @DisplayName("Miembro puede canjear una recompensa si tiene puntos suficientes")
    void miembroPuedeCanjearRecompensa() throws Exception {
        // Dar puntos suficientes
        var adminUser = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ADMIN).findFirst().orElseThrow();
        pointsService.earnPoints(memberProfileId, 500, TransactionSource.PURCHASE, "Visita especial", adminUser);

        var body = Map.of("rewardId", rewardId.toString());

        mockMvc.perform(post("/api/redemptions")
                        .header("Authorization", memberToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code", notNullValue()))
                .andExpect(jsonPath("$.status", is("ISSUED")));
    }

    @Test
    @DisplayName("Miembro NO puede canjear si no tiene puntos suficientes")
    void miembroNoPuedeCanjearSinPuntosSuficientes() throws Exception {
        // El miembro tiene 0 puntos, la recompensa cuesta 100
        var body = Map.of("rewardId", rewardId.toString());

        mockMvc.perform(post("/api/redemptions")
                        .header("Authorization", memberToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @DisplayName("Miembro puede ver su historial de canjes")
    void miembroPuedeVerSusCanjes() throws Exception {
        mockMvc.perform(get("/api/members/me/redemptions")
                        .header("Authorization", memberToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", instanceOf(java.util.List.class)));
    }

    @Test
    @DisplayName("Miembro ve su canje en el historial después de canjear")
    void miembroPuedeVerCanjesDespuesDeCanjear() throws Exception {
        var adminUser = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ADMIN).findFirst().orElseThrow();
        pointsService.earnPoints(memberProfileId, 500, TransactionSource.PURCHASE, "Visita", adminUser);

        var body = Map.of("rewardId", rewardId.toString());
        mockMvc.perform(post("/api/redemptions")
                        .header("Authorization", memberToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/members/me/redemptions")
                        .header("Authorization", memberToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", not(empty())))
                .andExpect(jsonPath("$[0].rewardName", is("Café gratis")))
                .andExpect(jsonPath("$[0].status", is("ISSUED")));
    }

    // =============================================
    // SEGURIDAD — Miembro no puede acceder al panel admin
    // =============================================

    @Test
    @DisplayName("Miembro NO puede acceder a endpoints de admin (403)")
    void miembroNoPuedeAccederPanelAdmin() throws Exception {
        mockMvc.perform(get("/api/admin/members")
                        .header("Authorization", memberToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Miembro NO puede ver estadísticas de admin (403)")
    void miembroNoPuedeVerEstadisticas() throws Exception {
        mockMvc.perform(get("/api/admin/stats")
                        .header("Authorization", memberToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Sin token no se puede acceder a endpoints de miembro (401/403)")
    void sinTokenNoPuedeVerPerfil() throws Exception {
        mockMvc.perform(get("/api/members/me"))
                .andExpect(status().is4xxClientError());
    }
}
