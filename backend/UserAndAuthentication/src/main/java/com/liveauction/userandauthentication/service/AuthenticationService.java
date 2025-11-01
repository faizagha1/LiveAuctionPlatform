package com.liveauction.userandauthentication.service;

import com.liveauction.shared.constants.RoleConstants;
import com.liveauction.shared.events.AuthenticationEvents.PasswordResetEvent;
import com.liveauction.shared.events.AuthenticationEvents.UserCreatedEvent;
import com.liveauction.userandauthentication.dto.request.*;
import com.liveauction.userandauthentication.dto.response.AuctioneerApplicationResponse;
import com.liveauction.userandauthentication.dto.response.AuthResponse;
import com.liveauction.userandauthentication.entity.*;
import com.liveauction.userandauthentication.entity.enums.AuctioneerApplicationStatus;
import com.liveauction.userandauthentication.entity.enums.VerificationTokenType;
import com.liveauction.userandauthentication.event.producer.AuthenticationEventProducer;
import com.liveauction.userandauthentication.exceptions.*;
import com.liveauction.userandauthentication.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final AuctioneerApplicationRepository auctioneerApplicationRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationEventProducer authenticationEventProducer;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final SecurityService securityService;

    private static final Duration EMAIL_TOKEN_EXPIRY = Duration.ofHours(24);
    private static final Duration PASSWORD_RESET_TOKEN_EXPIRY = Duration.ofMinutes(15);
    private static final Duration REFRESH_TOKEN_EXPIRY = Duration.ofDays(30);

    /**
     * Register a new user and send verification email
     */
    @Transactional
    public void registerUser(SignupRequest request) {
        log.info("User registration initiated for: {}", request.email());

        validateUserDoesNotExist(request);

        Set<RoleEntity> assignedRoles = assignDefaultRoles();
        UserEntity user = buildNewUser(request, assignedRoles);
        assignSpecialRoles(user);

        user = userRepository.save(user);
        log.info("User saved with ID: {}", user.getId());

        sendEmailVerification(user);
        log.info("User registration completed successfully for: {}", request.email());
    }

    /**
     * Verify user email with token
     */
    @Transactional
    public void verifyEmail(String token) {
        log.info("Email verification initiated");

        if (token == null || token.isBlank()) {
            log.warn("Email verification failed: Token was null or blank");
            throw new BadRequestException("Invalid verification token");
        }

        UUID userId = extractUserIdFromToken(token);

        UUID userIdFromToken = verificationTokenRepository
                .findUserIdByTokenAndExpiryDateAfter(token, Instant.now())
                .orElseThrow(() -> new BadRequestException("Invalid or expired verification token"));

        if (!userId.equals(userIdFromToken)) {
            log.error("Token user ID mismatch: {} vs {}", userId, userIdFromToken);
            throw new BadRequestException("Token verification failed");
        }

        int deletedCount = verificationTokenRepository.deleteValidToken(token, Instant.now());
        if (deletedCount != 1) {
            log.warn("Token already used or expired for user: {}", userId);
            throw new BadRequestException("Token has already been used or is expired");
        }

        activateUser(userId);
        log.info("Email verified successfully for user: {}", userId);
    }

    /**
     * Login user and return access + refresh tokens
     */
    @Transactional
    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for: {}", request.email());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        UserEntity user = (UserEntity) authentication.getPrincipal();
        validateUserIsActive(user);

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        saveRefreshToken(user.getId(), refreshToken);
        log.info("Login successful for: {}", request.email());
        return new AuthResponse(accessToken, refreshToken);
    }

    /**
     * Refresh access token using refresh token
     */
    @Transactional
    public AuthResponse refreshToken(String refreshTokenString) {
        log.info("Token refresh initiated");

        UUID userId = extractUserIdFromToken(refreshTokenString);

        RefreshTokenEntity refreshToken = refreshTokenRepository
                .findByTokenAndUserId(refreshTokenString, userId)
                .orElseThrow(() -> new BadRequestException("Invalid refresh token"));

        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
            log.warn("Expired refresh token used by user: {}", userId);
            refreshTokenRepository.delete(refreshToken);
            throw new BadRequestException("Refresh token has expired. Please log in again.");
        }

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        String newAccessToken = jwtService.generateAccessToken(user);

        // Token rotation
        String newRefreshToken = jwtService.generateRefreshToken(user);
        refreshToken.setToken(newRefreshToken);
        refreshToken.setExpiryDate(Instant.now().plus(REFRESH_TOKEN_EXPIRY));
        refreshTokenRepository.save(refreshToken);

        log.info("Token refreshed successfully for user: {}", userId);
        return new AuthResponse(newAccessToken, newRefreshToken);
    }

    /**
     * Initiate password reset flow
     */
    @Transactional
    public void forgotPassword(ForgetPasswordRequest request) {
        log.info("Password reset requested for email: {}", request.email());

        UserEntity user = userRepository
                .findByEmail(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("No account found with that email address"));

        String resetToken = jwtService.generateRefreshToken(user);

        VerificationTokenEntity tokenEntity = VerificationTokenEntity.builder()
                .token(resetToken)
                .userId(user.getId())
                .expiryDate(Instant.now().plus(PASSWORD_RESET_TOKEN_EXPIRY))
                .type(VerificationTokenType.PASSWORD_RESET)
                .build();

        verificationTokenRepository.save(tokenEntity);
        sendPasswordResetEmail(user.getEmail(), resetToken);
        log.info("Password reset email sent to: {}", request.email());
    }

    /**
     * Reset password with token
     */
    @Transactional
    public void resetPassword(String token, ResetPasswordRequest request) {
        log.info("Password reset initiated");

        UUID userIdFromJwt = extractUserIdFromToken(token);

        UUID userIdFromToken = verificationTokenRepository
                .findUserIdByTokenAndExpiryDateAfter(token, Instant.now())
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));

        if (!userIdFromJwt.equals(userIdFromToken)) {
            log.error("Token user ID mismatch during password reset");
            throw new BadRequestException("Invalid reset token");
        }

        int deletedCount = verificationTokenRepository.deleteValidToken(token, Instant.now());
        if (deletedCount != 1) {
            log.error("Reset token already used or expired");
            throw new BadRequestException("Reset token has already been used or is expired");
        }

        UserEntity user = userRepository.findById(userIdFromToken)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userIdFromToken));

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        // Invalidate all refresh tokens for security
        refreshTokenRepository.deleteByUserId(user.getId());
        log.info("Password reset successful for user: {}", user.getId());
    }

    @Transactional
    public AuctioneerApplicationResponse applyForAuctioneer(AuctioneerApplicationRequest request) {
        log.info("Auctioneer application initiated for: {}", request.email());
        UUID userId = securityService.getCurrentUserId();

        if (auctioneerApplicationRepository.existsByUserId(userId)) {
            log.warn("User {} already has an application on file", userId);
            throw new ResourceConflictException("You already have an application on file");
        }

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        AuctioneerApplicationEntity applicationEntity = AuctioneerApplicationEntity
                .builder()
                .userId(user.getId())
                .appliedAt(Instant.now())
                .status(AuctioneerApplicationStatus.PENDING)
                .reason(request.reason())
                .build();

        applicationEntity = auctioneerApplicationRepository.save(applicationEntity);
        log.info("Auctioneer application saved with ID: {}", applicationEntity.getId());

        return new AuctioneerApplicationResponse(
                applicationEntity.getAppliedAt(),
                applicationEntity.getStatus().name()
        );
    }

    // ============================================================================
    // PRIVATE HELPER METHODS
    // ============================================================================

    private void validateUserDoesNotExist(SignupRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            log.warn("Registration failed: Email {} already exists", request.email());
            throw new DuplicateResourceException("Email is already registered");
        }

        if (userRepository.existsByUsername(request.username())) {
            log.warn("Registration failed: Username {} already taken", request.username());
            throw new DuplicateResourceException("Username is already taken");
        }
    }

    private Set<RoleEntity> assignDefaultRoles() {
        Set<RoleEntity> roles = new HashSet<>();
        roles.add(findRoleOrFail(RoleConstants.ROLE_USER));
        roles.add(findRoleOrFail(RoleConstants.ROLE_SELLER));
        log.debug("Assigned default roles: USER, SELLER");
        return roles;
    }

    private UserEntity buildNewUser(SignupRequest request, Set<RoleEntity> roles) {
        return UserEntity.builder()
                .username(request.username())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .roles(roles)
                .status(UserEntity.UserStatus.UNVERIFIED)
                .build();
    }

    private void assignSpecialRoles(UserEntity user) {
        if (user.getEmail().endsWith("@admindomain.com")) {
            user.getRoles().add(findRoleOrFail(RoleConstants.ROLE_ADMIN));
            log.info("Assigned ADMIN role to user: {}", user.getEmail());
        }
    }

    private void sendEmailVerification(UserEntity user) {
        String verificationToken = jwtService.generateRefreshToken(user);

        VerificationTokenEntity tokenEntity = VerificationTokenEntity.builder()
                .token(verificationToken)
                .userId(user.getId())
                .expiryDate(Instant.now().plus(EMAIL_TOKEN_EXPIRY))
                .type(VerificationTokenType.EMAIL_VERIFICATION)
                .build();

        verificationTokenRepository.save(tokenEntity);

        UserCreatedEvent event = new UserCreatedEvent(
                user.getId(),
                "organization@email.com",
                user.getEmail(),
                verificationToken
        );

        try {
            authenticationEventProducer.userCreated(event);
            log.info("Email verification event published for user: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to publish user created event: {}", e.getMessage(), e);
            // Don't fail registration if event publishing fails
        }
    }

    private void sendPasswordResetEmail(String email, String resetToken) {
        PasswordResetEvent event = new PasswordResetEvent(email, resetToken);

        try {
            authenticationEventProducer.passwordResetRequested(event);
            log.info("Password reset event published for email: {}", email);
        } catch (Exception e) {
            log.error("Failed to publish password reset event: {}", e.getMessage(), e);
            throw new OperationFailedException("Failed to send password reset email. Please try again.", e);
        }
    }

    private void activateUser(UUID userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (user.getStatus() == UserEntity.UserStatus.ACTIVE) {
            log.info("User {} already active", userId);
            return;
        }

        user.setStatus(UserEntity.UserStatus.ACTIVE);
        userRepository.save(user);
        log.info("User {} activated successfully", userId);
    }

    private void validateUserIsActive(UserEntity user) {
        if (user.getStatus() != UserEntity.UserStatus.ACTIVE) {
            log.warn("Login attempt for unverified user: {}", user.getEmail());
            throw new UnauthorizedException("Please verify your email before logging in. Check your inbox for the verification link.");
        }
    }

    private void saveRefreshToken(UUID userId, String token) {
        RefreshTokenEntity refreshToken = RefreshTokenEntity.builder()
                .token(token)
                .userId(userId)
                .expiryDate(Instant.now().plus(REFRESH_TOKEN_EXPIRY))
                .build();

        refreshTokenRepository.save(refreshToken);
        log.debug("Refresh token saved for user: {}", userId);
    }

    private UUID extractUserIdFromToken(String token) {
        try {
            return UUID.fromString(jwtService.extractUserId(token));
        } catch (Exception e) {
            log.error("Failed to extract user ID from token: {}", e.getMessage());
            throw new BadRequestException("Invalid token format", e);
        }
    }

    private RoleEntity findRoleOrFail(String roleName) {
        return roleRepository.findByName(roleName)
                .orElseThrow(() -> {
                    log.error("CRITICAL: Role '{}' not found in database", roleName);
                    return new ResourceNotFoundException(String.format("System configuration error: Role '%s' not found", roleName));
                });
    }
}