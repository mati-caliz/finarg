package com.finarg.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.annotation.PreDestroy;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final int MAX_BUCKETS = 50_000;
    private static final long AUTH_REQUESTS_PER_MINUTE = 10;
    private static final long API_REQUESTS_PER_MINUTE = 60;

    private final Map<String, BucketEntry> authBuckets = new ConcurrentHashMap<>();
    private final Map<String, BucketEntry> apiBuckets = new ConcurrentHashMap<>();
    private final ScheduledExecutorService cleaner;

    public RateLimitingFilter() {
        this.cleaner = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread t = new Thread(r, "rate-limit-cleaner");
            t.setDaemon(true);
            return t;
        });
        this.cleaner.scheduleAtFixedRate(this::evictExpiredEntries, 5, 5, TimeUnit.MINUTES);
    }

    @PreDestroy
    public void shutdown() {
        if (cleaner != null && !cleaner.isShutdown()) {
            cleaner.shutdown();
        }
    }

    private Bucket createAuthBucket() {
        Bandwidth limit = Bandwidth.builder()
                .capacity(AUTH_REQUESTS_PER_MINUTE)
                .refillGreedy(AUTH_REQUESTS_PER_MINUTE, Duration.ofMinutes(1))
                .build();
        return Bucket.builder().addLimit(limit).build();
    }

    private Bucket createApiBucket() {
        Bandwidth limit = Bandwidth.builder()
                .capacity(API_REQUESTS_PER_MINUTE)
                .refillGreedy(API_REQUESTS_PER_MINUTE, Duration.ofMinutes(1))
                .build();
        return Bucket.builder().addLimit(limit).build();
    }

    private Bucket resolveBucket(Map<String, BucketEntry> buckets, String key, Supplier<Bucket> bucketFactory) {
        if (buckets.size() >= MAX_BUCKETS) {
            evictOldest(buckets);
        }
        BucketEntry entry = buckets.computeIfAbsent(key, k -> new BucketEntry(bucketFactory.get()));
        entry.lastAccess = System.currentTimeMillis();
        return entry.bucket;
    }

    private String getClientIdentifier(HttpServletRequest request) {
        return request.getRemoteAddr();
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String clientId = getClientIdentifier(request);
        Bucket bucket = null;

        if (path.startsWith("/api/v1/auth/")) {
            bucket = resolveBucket(authBuckets, clientId, this::createAuthBucket);
        } else if (path.startsWith("/api/v1/")) {
            bucket = resolveBucket(apiBuckets, clientId, this::createApiBucket);
        }

        if (bucket != null && !bucket.tryConsume(1)) {
            rejectRequest(response);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private void rejectRequest(HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType("application/json");
        response.getWriter().write("{\"error\":\"Too many requests. Please try again later.\"}");
    }

    private void evictExpiredEntries() {
        long cutoff = System.currentTimeMillis() - TimeUnit.MINUTES.toMillis(10);
        authBuckets.entrySet().removeIf(e -> e.getValue().lastAccess < cutoff);
        apiBuckets.entrySet().removeIf(e -> e.getValue().lastAccess < cutoff);
    }

    private void evictOldest(Map<String, BucketEntry> buckets) {
        long cutoff = System.currentTimeMillis() - TimeUnit.MINUTES.toMillis(2);
        buckets.entrySet().removeIf(e -> e.getValue().lastAccess < cutoff);
    }

    private static class BucketEntry {
        final Bucket bucket;
        volatile long lastAccess;

        BucketEntry(Bucket bucket) {
            this.bucket = bucket;
            this.lastAccess = System.currentTimeMillis();
        }
    }
}
