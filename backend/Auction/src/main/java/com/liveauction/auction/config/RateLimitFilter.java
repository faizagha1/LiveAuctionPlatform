package com.liveauction.auction.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.liveauction.shared.dto.response.ApiResponse;
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
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;

    // Rate limit configs
    private static final int DEFAULT_REQUESTS_PER_MINUTE = 100;
    private static final int CLAIM_REQUESTS_PER_MINUTE = 10; // Stricter for claiming

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

        Bucket bucket = resolveBucket(key, rateLimit);

        if (bucket.tryConsume(1)) {
            response.setHeader("X-Rate-Limit-Remaining", String.valueOf(bucket.getAvailableTokens()));
            filterChain.doFilter(request, response);
        } else {
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

    private Bucket resolveBucket(String key, int requestsPerMinute) {
        return cache.computeIfAbsent(key, k -> createNewBucket(requestsPerMinute));
    }

    private Bucket createNewBucket(int requestsPerMinute) {
        Bandwidth limit = Bandwidth.classic(
                requestsPerMinute,
                Refill.intervally(requestsPerMinute, Duration.ofMinutes(1))
        );
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    private String resolveKey(HttpServletRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof UUID userId) {
            return "user:" + userId.toString();
        }

        String apiKey = request.getHeader("X-API-Key");
        if (apiKey != null && !apiKey.isBlank()) {
            return "api-key:" + apiKey;
        }

        return "ip:" + getClientIp(request);
    }

    private int getRateLimitForEndpoint(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        // Stricter limits for claim/auction creation
        if (path.equals("/api/v2/auctions/claim") && method.equals("POST")) {
            return CLAIM_REQUESTS_PER_MINUTE;
        }
        if (path.startsWith("/api/v2/auctions/claims") && path.endsWith("/create-auction") && method.equals("POST")) {
            return CLAIM_REQUESTS_PER_MINUTE;
        }

        return DEFAULT_REQUESTS_PER_MINUTE;
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.equals("/health") || path.startsWith("/actuator");
    }
}