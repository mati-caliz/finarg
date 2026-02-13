package com.finarg.core.config;

import com.fasterxml.jackson.databind.exc.MismatchedInputException;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.cache.Cache;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.serializer.SerializationException;

@Slf4j
@Configuration
public class CacheConfig implements CachingConfigurer {

    private static boolean isDeserializationError(RuntimeException exception) {
        if (exception instanceof SerializationException || exception instanceof ClassCastException) {
            return true;
        }
        Throwable cause = exception.getCause();
        while (cause != null) {
            if (cause instanceof MismatchedInputException || cause instanceof ClassCastException) {
                return true;
            }
            cause = cause.getCause();
        }
        return false;
    }

    @Override
    public CacheErrorHandler errorHandler() {
        return new CacheErrorHandler() {
            @Override
            public void handleCacheGetError(@NonNull RuntimeException exception, @NonNull Cache cache, @NonNull Object key) {
                if (isDeserializationError(exception)) {
                    log.warn("Cache deserialization error for {} key {}, evicting and treating as cache miss: {}",
                            cache.getName(), key, exception.getMessage());
                    try {
                        cache.evict(key);
                    } catch (Exception e) {
                        log.debug("Could not evict cache key: {}", e.getMessage());
                    }
                } else {
                    throw exception;
                }
            }

            @Override
            public void handleCachePutError(@NonNull RuntimeException exception, @NonNull Cache cache, @NonNull Object key, Object value) {
                log.warn("Cache put error for {} key {}: {}", cache.getName(), key, exception.getMessage());
            }

            @Override
            public void handleCacheEvictError(@NonNull RuntimeException exception, @NonNull Cache cache, @NonNull Object key) {
                log.warn("Cache evict error for {} key {}: {}", cache.getName(), key, exception.getMessage());
            }

            @Override
            public void handleCacheClearError(@NonNull RuntimeException exception, @NonNull Cache cache) {
                log.warn("Cache clear error for {}: {}", cache.getName(), exception.getMessage());
            }
        };
    }
}
