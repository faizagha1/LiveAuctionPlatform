package com.liveauction.userandauthentication.service;

import com.liveauction.shared.constants.RoleConstants;
import com.liveauction.shared.events.AuthenticationEvents.UserCreatedEvent;
import com.liveauction.userandauthentication.dto.request.LoginRequest;
import com.liveauction.userandauthentication.dto.request.SignupRequest;
import com.liveauction.userandauthentication.dto.response.AuthResponse;
import com.liveauction.userandauthentication.entity.RefreshTokenEntity;
import com.liveauction.userandauthentication.entity.RoleEntity;
import com.liveauction.userandauthentication.entity.UserEntity;
import com.liveauction.userandauthentication.entity.VerificationTokenEntity;
import com.liveauction.userandauthentication.entity.enums.VerificationTokenType;
import com.liveauction.userandauthentication.event.producer.AuthenticationEventProducer;
import com.liveauction.userandauthentication.repository.RefreshTokenRepository;
import com.liveauction.userandauthentication.repository.RoleRepository;
import com.liveauction.userandauthentication.repository.VerificationTokenRepository;
import com.liveauction.userandauthentication.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationEventProducer authenticationEventProducer;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserService userService;

    @Transactional
    public void registerUser(SignupRequest request) {
        log.info("User registration initiated for: {}", request.email());

        if (userRepository.existsByEmail(request.email())) {
            log.warn("Registration failed: Email {} is already in use.", request.email());
            throw new RuntimeException("Email is already in use");
        }

        if (userRepository.existsByUsername(request.username())) {
            log.warn("Registration failed: Username {} is already taken.", request.username());
            throw new RuntimeException("Username is already taken");
        }

        Set<RoleEntity> assignedRoles = new HashSet<>();
        RoleEntity userRole = findRoleOrFail(RoleConstants.ROLE_USER);
        RoleEntity sellerRole = findRoleOrFail(RoleConstants.ROLE_SELLER);
        assignedRoles.add(userRole);
        assignedRoles.add(sellerRole);
        log.info("Assigned ROLE_USER and ROLE_SELLER to new user: {}", request.email());

        UserEntity user = UserEntity.builder()
                .username(request.username())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .roles(assignedRoles)
                .build();

        if (request.email().endsWith("@admindomain.com")) {
            RoleEntity adminRole = findRoleOrFail(RoleConstants.ROLE_ADMIN);
            user.getRoles().add(adminRole);
            log.info("Assigned ROLE_ADMIN to user: {}", request.email());
        }

        if (request.email().endsWith("@auctioneerdomain.com")) {
            RoleEntity auctioneerRole = findRoleOrFail(RoleConstants.ROLE_AUCTIONEER);
            user.getRoles().add(auctioneerRole);
            user.setAuctioneerRating(BigDecimal.valueOf(0.00));
            log.info("Assigned ROLE_AUCTIONEER to user: {}", request.email());
        }

        user = userRepository.save(user);

        // Using generateRefreshToken here as a verification token is an interesting choice,
        // but it works with your verifyEmailToken logic.
        String token = jwtService.generateRefreshToken(user);

        VerificationTokenEntity tokenEntity = VerificationTokenEntity
                .builder()
                .token(token)
                .userId(user.getId())
                .expiryDate(Instant.now().plus(Duration.ofHours(1)))
                .type(VerificationTokenType.EMAIL_VERIFICATION)
                .build();

        tokenEntity = verificationTokenRepository.save(tokenEntity);

        UserCreatedEvent event = new UserCreatedEvent(
                user.getId().toString(),
                user.getEmail(),
                tokenEntity.getToken()
        );

        try {
            authenticationEventProducer.userCreated(event);
            log.info("User created event sent successfully: {}", event);
        } catch (Exception e) {
            log.error("Failed to send user created event: {}", e.getMessage());
        }
        log.info("User registered successfully: {}", request.email());
    }

    @Transactional
    public void verifyEmailToken(String token) {
        log.info("Verifying email token: {}", token);
        if (token == null || token.isBlank()) {
            throw new RuntimeException("Invalid verification token");
        }

        UUID userId = UUID.fromString(jwtService.extractUserId(token));
        UUID userIdFromRepo = verificationTokenRepository.findUserIdByTokenAndExpiryDateAfter(token, Instant.now())
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));

        log.info("Email token found successfully for user: {}", userId);
        if (!userId.equals(userIdFromRepo)) {
            throw new RuntimeException("Cannot verify email for current user");
        }

        log.info("Email token is for the same user : {}", userId);
        int deleted = verificationTokenRepository.deleteValidToken(token, Instant.now());
        if (deleted != 1) {
            throw new RuntimeException("Token already used or expired");
        }

        log.info(" Email token verified successfully for user: {}", userId);
        UserEntity user = userRepository
                .findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getStatus() == UserEntity.UserStatus.ACTIVE) {
            return;
        }
        user.setStatus(UserEntity.UserStatus.ACTIVE);
    }

    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for: {}", request.email());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()
                )
        );

        // Get the user details from the authentication object itself
        UserEntity user = (UserEntity) authentication.getPrincipal();

        String accessToken = jwtService.generateAccessToken(user);
        String refreshTokenString = jwtService.generateRefreshToken(user);

        RefreshTokenEntity refreshToken = RefreshTokenEntity
                .builder()
                .token(refreshTokenString)
                .userId(user.getId()) // Use the ID from the authenticated user
                .expiryDate(Instant.now().plus(Duration.ofDays(30)))
                .build();

        refreshTokenRepository.save(refreshToken);

        log.info("Login successful for: {}", request.email());
        return new AuthResponse(
                accessToken
        );
    }

    public AuthResponse refreshToken() {
        log.info("Token refresh initiated");

        // This assumes a filter has authenticated the user (e.g., from an expired access token)
        // and populated the SecurityContextHolder.
        UUID userId = userService.getAuthenticatedUser().getId();

        RefreshTokenEntity refreshToken = refreshTokenRepository
                .findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Refresh token not found for user: " + userId));

        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(refreshToken); // Clean up expired token
            throw new RuntimeException("Refresh token expired");
        }

        String accessToken = jwtService.generateAccessToken(userService.getAuthenticatedUser());

        return new AuthResponse(
                accessToken
        );
    }

    private RoleEntity findRoleOrFail(String roleType) {
        return roleRepository.findByName(roleType)
                .orElseThrow(() -> {
                    log.error("CRITICAL: Role '{}' not found in database.", roleType);
                    return new RuntimeException("Required role not found: " + roleType);
                });
    }
}