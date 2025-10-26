package com.liveauction.userandauthentication.controller;

import com.liveauction.shared.dto.response.ApiResponse;
import com.liveauction.userandauthentication.dto.request.LoginRequest;
import com.liveauction.userandauthentication.dto.request.SignupRequest;
import com.liveauction.userandauthentication.dto.response.AuthResponse;
import com.liveauction.userandauthentication.service.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/authentication")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    /**
     * POST /api/v1/authentication/register
     * Register a new user
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> signup(@Valid @RequestBody SignupRequest request) {
        authenticationService.registerUser(request);
        ApiResponse<Void> apiResponse = ApiResponse.success("User registered successfully", null);
        return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
    }

    /**
     * POST /api/v1/authentication/login
     * Login and get JWT token
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authenticationService.login(request);
        ApiResponse<AuthResponse> apiResponse = ApiResponse.success("User logged in" ,response);
        return new ResponseEntity<>(apiResponse, HttpStatus.OK);
    }
}
