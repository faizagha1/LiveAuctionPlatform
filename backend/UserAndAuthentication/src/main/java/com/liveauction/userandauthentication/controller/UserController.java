package com.liveauction.userandauthentication.controller;

import com.liveauction.shared.dto.response.ApiResponse;
import com.liveauction.userandauthentication.dto.response.UserResponse;
import com.liveauction.userandauthentication.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v2/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * GET /api/v2/users/me
     * Get current user's profile
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMyProfile() {
        log.info("Request received to fetch current user profile");
        UserResponse response = userService.getUserProfile();
        return ResponseEntity.ok(ApiResponse.success("User profile fetched successfully", response));
    }
}