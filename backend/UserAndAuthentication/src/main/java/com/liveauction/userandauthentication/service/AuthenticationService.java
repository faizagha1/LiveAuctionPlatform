package com.liveauction.userandauthentication.service;

import com.liveauction.shared.constants.RoleConstants;
import com.liveauction.userandauthentication.dto.request.LoginRequest;
import com.liveauction.userandauthentication.dto.request.SignupRequest;
import com.liveauction.userandauthentication.dto.response.AuthResponse;
import com.liveauction.userandauthentication.entity.RoleEntity;
import com.liveauction.userandauthentication.entity.UserEntity;
import com.liveauction.userandauthentication.repository.RoleRepository;
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
import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    /**
     * Register a new user
     * - Check for duplicate username/email
     * - Assign ROLE_USER + ROLE_SELLER to everyone
     * - If email ends with @auctioneerdomain.com, add ROLE_AUCTIONEER
     * - If email ends with @admindomain.com, add ROLE_ADMIN
     * - Hash password with BCrypt
     * - Save user
     * - Return success (no JWT yet, user must login)
     */
    @Transactional
    public void registerUser(SignupRequest request) {
        log.info("User registration initiated for: {}", request.email());

        if (userRepository.existsByEmail(request.email())){
            log.warn("Registration failed: Email {} is already in use.", request.email());
            throw new RuntimeException("Email is already in use");
        }

        if(userRepository.existsByUsername(request.username())){
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

        if(request.email().endsWith("@admindomain.com")){
            RoleEntity adminRole = findRoleOrFail(RoleConstants.ROLE_ADMIN);
            user.getRoles().add(adminRole);
            log.info("Assigned ROLE_ADMIN to user: {}", request.email());
        }

        if(request.email().endsWith("@auctioneerdomain.com")){
            RoleEntity auctioneerRole = findRoleOrFail(RoleConstants.ROLE_AUCTIONEER);
            user.getRoles().add(auctioneerRole);
            user.setAuctioneerRating(BigDecimal.valueOf(0.00));
            log.info("Assigned ROLE_AUCTIONEER to user: {}", request.email());
        }

        user = userRepository.save(user);
        log.info("User registered successfully: {}", request.email());
    }

    /**
     * Login user
     * - Authenticate with email + password
     * - If successful, generate JWT token
     * - Return token in AuthResponse
     */
    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for: {}", request.email());
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()
                )
        );
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtService.generateToken(userDetails);
        log.info("Login successful for: {}", request.email());
        return new AuthResponse(
                token
        );
    }

    /**
     * Helper method to find role or throw exception
     */
    private RoleEntity findRoleOrFail(String roleType) {
        return roleRepository.findByName(roleType)
                .orElseThrow(() -> {
                    log.error("CRITICAL: Role '{}' not found in database.", roleType);
                    return new RuntimeException("Required role not found: " + roleType);
                });
    }
}