package com.liveauction.userandauthentication.config;

import com.liveauction.shared.dto.response.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    // NOTE: This is an in-memory-only cache.
    // For a distributed/production environment, this must be replaced with
    // a persistent, shared cache like Redis (e.g., using Bucket4j + JCache/Redis).
    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;

    // Rate limit configs
    private static final int DEFAULT_REQUESTS_PER_MINUTE = 100;
    private static final int AUTH_REQUESTS_PER_MINUTE = 10; // Stricter for auth endpoints

    @PostConstruct
    public void init() {
        log.warn("==================================================================================");
        log.warn("RateLimitFilter is using an IN-MEMORY cache.");
        log.warn("This is NOT suitable for a multi-instance production environment.");
        log.warn("Replace with a distributed cache (e.g., Redis) for production use.");
        log.warn("==================================================================================");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String key = resolveKey(request);
        int rateLimit = getRateLimitForEndpoint(request);

        Bucket bucket = cache.computeIfAbsent(key, k -> createNewBucket(rateLimit));

        if (bucket.tryConsume(1)) {
            // Request allowed
            response.setHeader("X-Rate-Limit-Remaining", String.valueOf(bucket.getAvailableTokens()));
            filterChain.doFilter(request, response);
        } else {
            // Rate limit exceeded
            log.warn("Rate limit exceeded for key: {} (Endpoint: {} {})", key, request.getMethod(), request.getRequestURI());
            sendErrorResponse(response);
        }
    }

    private void sendErrorResponse(HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        ApiResponse<Void> apiResponse = ApiResponse.error("Too many requests. Please try again later.");

        response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
    }

    /**
     * Create a new rate limit bucket using the token bucket algorithm.
     */
    private Bucket createNewBucket(int requestsPerMinute) {
        Bandwidth limit = Bandwidth.classic(
                requestsPerMinute,
                Refill.intervally(requestsPerMinute, Duration.ofMinutes(1))
        );
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    /**
     * Resolve unique key for rate limiting.
     * Priority: Authenticated User ID > API Key > IP Address
     */
    private String resolveKey(HttpServletRequest request) {
        // 1. Try to get authenticated user ID from SecurityContext
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !(auth.getPrincipal() instanceof String)) {
            // auth.getName() should be the User ID (UUID string) as defined in UserEntity.getUsername()
            return "user:" + auth.getName();
        }

        // 2. Try to get API key (if implemented)
        String apiKey = request.getHeader("X-API-Key");
        if (apiKey != null && !apiKey.isBlank()) {
            return "api-key:" + apiKey;
        }

        // 3. Fall back to IP address
        String clientIp = getClientIp(request);
        return "ip:" + clientIp;
    }

    /**
     * Get different rate limits for different endpoints.
     */
    private int getRateLimitForEndpoint(HttpServletRequest request) {
        String path = request.getRequestURI();

        // Stricter limits for auth endpoints (prevent brute force)
        if (path.startsWith("/api/v2/authentication/")) {
            return switch (path) {
                case "/api/v2/authentication/login", "/api/v2/authentication/register",
                     "/api/v2/authentication/forgot-password", "/api/v2/authentication/reset-password" ->
                        AUTH_REQUESTS_PER_MINUTE;
                default -> DEFAULT_REQUESTS_PER_MINUTE;
            };
        }

        // Default limit for other endpoints
        return DEFAULT_REQUESTS_PER_MINUTE;
    }

    /**
     * Extract real client IP, handling proxies (X-Forwarded-For, X-Real-IP).
     */
    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            // The first IP in the list is the original client IP
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }

    /**
     * Do not rate limit health checks or actuator endpoints.
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.equals("/health") || path.startsWith("/actuator");
    }
}