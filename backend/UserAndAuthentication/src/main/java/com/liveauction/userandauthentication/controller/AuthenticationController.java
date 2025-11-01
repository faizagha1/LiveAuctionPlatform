package com.liveauction.userandauthentication.controller;

import com.liveauction.shared.dto.response.ApiResponse;
import com.liveauction.userandauthentication.dto.request.*;
import com.liveauction.userandauthentication.dto.response.AuctioneerApplicationResponse;
import com.liveauction.userandauthentication.dto.response.AuthResponse;
import com.liveauction.userandauthentication.exceptions.BadRequestException;
import com.liveauction.userandauthentication.service.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v2/authentication")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    /**
     * POST /api/v2/authentication/register
     * Register a new user and send verification email
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(@Valid @RequestBody SignupRequest request) {
        log.info("Registration request received for email: {}", request.email());
        authenticationService.registerUser(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully. Please check your email to verify your account.", null));
    }

    /**
     * GET /api/v2/authentication/verify-email?token=xxx
     * Verify user email with token
     */
    @GetMapping("/verify-email")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@RequestParam("token") String token) {
        log.info("Email verification request received");
        authenticationService.verifyEmail(token);
        return ResponseEntity.ok(
                ApiResponse.success("Email verified successfully. You can now log in.", null)
        );
    }

    /**
     * POST /api/v2/authentication/login
     * Login and get access + refresh tokens
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        log.info("Login request received for email: {}", request.email());
        AuthResponse response = authenticationService.login(request);
        return ResponseEntity.ok(
                ApiResponse.success("Login successful", response)
        );
    }

    /**
     * POST /api/v2/authentication/refresh
     * Get new access token using refresh token
     * Header: Authorization: Bearer <refresh_token>
     */
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @RequestHeader("Authorization") String authHeader
    ) {
        log.info("Token refresh request received");
        String refreshToken = extractTokenFromHeader(authHeader);
        AuthResponse response = authenticationService.refreshToken(refreshToken);
        return ResponseEntity.ok(
                ApiResponse.success("Token refreshed successfully", response)
        );
    }

    /**
     * POST /api/v2/authentication/forgot-password
     * Request password reset - sends email with reset link
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgetPasswordRequest request
    ) {
        log.info("Forgot password request received for email: {}", request.email());
        authenticationService.forgotPassword(request);
        return ResponseEntity.ok(
                ApiResponse.success("Password reset email sent. Please check your inbox.", null)
        );
    }

    @PostMapping("/apply-for-auctioneer")
    public ResponseEntity<ApiResponse<AuctioneerApplicationResponse>> applyForAuctioneer(
            @Valid @RequestBody AuctioneerApplicationRequest request
    ) {
        log.info("Auctioneer application request received for email: {}", request.email());
        AuctioneerApplicationResponse response = authenticationService.applyForAuctioneer(request);
        return ResponseEntity.ok(ApiResponse.success("Auctioneer application submitted successfully", response));
    }

    /**
     * POST /api/v2/authentication/reset-password?token=xxx
     * Reset password with token from email
     */
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @RequestParam("token") String token,
            @Valid @RequestBody ResetPasswordRequest request
    ) {
        log.info("Password reset request received");
        authenticationService.resetPassword(token, request);
        return ResponseEntity.ok(
                ApiResponse.success("Password reset successfully. You can now log in with your new password.", null)
        );
    }

    /**
     * Helper method to extract JWT token from Authorization header
     */
    private String extractTokenFromHeader(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new BadRequestException("Invalid Authorization header format. Must be 'Bearer <token>'.");
        }
        return authHeader.substring(7);
    }
}