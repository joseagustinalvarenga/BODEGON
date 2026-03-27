package com.bodegon.club.repository;

import com.bodegon.club.entity.RefreshToken;
import com.bodegon.club.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    Optional<RefreshToken> findByTokenHash(String tokenHash);

    void deleteByUser(User user);
}
