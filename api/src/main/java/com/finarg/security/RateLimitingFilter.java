package com.finarg.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final int MAX_BUCKETS = 50_000;
    private static final int AUTH_REQUESTS_PER_MINUTE = 10;
    private static final int API_REQUESTS_PER_MINUTE = 60;

    private final Map<String, BucketEntry> authBuckets = new ConcurrentHashMap<>();
    private final Map<String, BucketEntry> apiBuckets = new ConcurrentHashMap<>();

    public RateLimitingFilter() {
        ScheduledExecutorService cleaner = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread t = new Thread(r, "rate-limit-cleaner");
            t.setDaemon(true);
            return t;
        });
        cleaner.scheduleAtFixedRate(this::evictExpiredEntries, 5, 5, TimeUnit.MINUTES);
    }

    private Bucket createAuthBucket() {
        Bandwidth limit = Bandwidth.classic(AUTH_REQUESTS_PER_MINUTE,
                Refill.greedy(AUTH_REQUESTS_PER_MINUTE, Duration.ofMinutes(1)));
        return Bucket.builder().addLimit(limit).build();
    }

    private Bucket createApiBucket() {
        Bandwidth limit = Bandwidth.classic(API_REQUESTS_PER_MINUTE,
                Refill.greedy(API_REQUESTS_PER_MINUTE, Duration.ofMinutes(1)));
        return Bucket.builder().addLimit(limit).build();
    }

    private Bucket resolveBucket(Map<String, BucketEntry> buckets, String key,
            java.util.function.Supplier<Bucket> bucketFactory) {
        if (buckets.size() >= MAX_BUCKETS) {
            evictOldest(buckets);
        }
        BucketEntry entry = buckets.computeIfAbsent(key,
                k -> new BucketEntry(bucketFactory.get()));
        entry.lastAccess = System.currentTimeMillis();
        return entry.bucket;
    }

    private String getClientIdentifier(HttpServletRequest request) {
        return request.getRemoteAddr();
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String clientId = getClientIdentifier(request);

        if (path.startsWith("/api/v1/auth/")) {
            Bucket bucket = resolveBucket(authBuckets, clientId, this::createAuthBucket);
            if (!bucket.tryConsume(1)) {
                rejectRequest(response);
                return;
            }
        } else if (path.startsWith("/api/v1/")) {
            Bucket bucket = resolveBucket(apiBuckets, clientId, this::createApiBucket);
            if (!bucket.tryConsume(1)) {
                rejectRequest(response);
                return;
            }
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
