package com.bodegon.club.controller;

import com.bodegon.club.dto.level.LevelConfigDto;
import com.bodegon.club.entity.enums.MemberLevel;
import com.bodegon.club.service.LevelConfigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class LevelConfigController {

    private final LevelConfigService service;

    /** Público — usado también por el dashboard del cliente */
    @GetMapping("/api/levels")
    public ResponseEntity<List<LevelConfigDto.Response>> getPublic() {
        return ResponseEntity.ok(service.getAll());
    }

    /** Admin — lista completa */
    @GetMapping("/api/admin/levels")
    public ResponseEntity<List<LevelConfigDto.Response>> getAdmin() {
        return ResponseEntity.ok(service.getAll());
    }

    /** Admin — actualiza umbral y beneficios de un nivel */
    @PutMapping("/api/admin/levels/{level}")
    public ResponseEntity<LevelConfigDto.Response> update(
            @PathVariable MemberLevel level,
            @RequestBody @Valid LevelConfigDto.Request req) {
        return ResponseEntity.ok(service.update(level, req));
    }
}
