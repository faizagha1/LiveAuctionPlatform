package com.liveauction.userandauthentication.entity;

import com.liveauction.userandauthentication.entity.enums.VerificationTokenType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "tokens", uniqueConstraints = {
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerificationTokenEntity extends BaseEntity {
    @Column(nullable = false, unique = true)
    private String token;

    @Column(nullable = false)
    private Instant expiryDate;

    @Column(nullable = false)
    private boolean used;

    @Column(nullable = false)
    private VerificationTokenType type;
}
