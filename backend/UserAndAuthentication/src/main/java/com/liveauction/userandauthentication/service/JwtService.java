package com.liveauction.userandauthentication.service;

import com.liveauction.userandauthentication.entity.UserEntity;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Duration;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

@Service
@Slf4j
public class JwtService {

    @Value("${app.jwt.secret}")
    private String secretKey;

    @Value("${app.jwt.access-token-expiration}")
    private Duration accessTokenExpiration;

    @Value("${app.jwt.refresh-token-expiration}")
    private Duration refreshTokenExpiration;

    private SecretKey signInKey;

    /**
     * Extract user ID (from token subject)
     */
    public String extractUserId(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extract any claim from token
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Generate JWT token for user
     * Subject = userId (UUID)
     * Claims = roles, username
     */
    public String generateAccessToken(UserDetails userDetails) {
        UserEntity user = (UserEntity) userDetails;
        Map<String, Object> claims = new HashMap<>();

        // Add roles to claims
        List<String> roles = user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();
        claims.put("roles", roles);
        claims.put("username", user.getUsername());

        return buildToken(claims, user, accessTokenExpiration);
    }

    public String generateRefreshToken(UserDetails userDetails) {
        UserEntity user = (UserEntity) userDetails;
        Map<String, Object> claims = new HashMap<>();

        claims.put("username", user.getUsername());

        return buildToken(claims, user, refreshTokenExpiration);
    }

    /**
     * Build the actual JWT token
     */
    private String buildToken(Map<String, Object> extraClaims, UserEntity user, Duration jwtExpiration) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .claims(extraClaims)
                .subject(user.getId().toString())
                .issuedAt(new Date(now))
                .expiration(new Date(now + jwtExpiration.toMillis()))
                .signWith(getSignInKey())
                .compact();
    }

    /**
     * Validate token against user
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            final String userId = extractUserId(token);
            UserEntity user = (UserEntity) userDetails;
            return userId.equals(user.getId().toString()) && !isTokenExpired(token);
        } catch (JwtException e) {
            log.warn("Invalid JWT token processing attempt: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Check if token is expired
     */
    private boolean isTokenExpired(String token) {
        try {
            return extractExpiration(token).before(new Date());
        } catch (JwtException e) {
            log.warn("Could not extract expiration from token: {}", e.getMessage());
            return true;
        }
    }

    /**
     * Extract expiration date from token
     */
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Extract all claims from token
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Get signing key from secret, lazy-initialized.
     */
    private SecretKey getSignInKey() {
        if (signInKey == null) {
            byte[] keyBytes = Decoders.BASE64.decode(secretKey);
            this.signInKey = Keys.hmacShaKeyFor(keyBytes);
        }
        return signInKey;
    }
}