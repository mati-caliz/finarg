package com.finarg.subscription.service;

import com.finarg.subscription.entity.UsageTracking;
import com.finarg.subscription.repository.UsageTrackingRepository;
import com.finarg.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Slf4j
@Service
@RequiredArgsConstructor
public class UsageTrackingService {

    private final UsageTrackingRepository usageTrackingRepository;

    public int getTodayUsage(User user, UsageTracking.UsageType usageType) {
        return usageTrackingRepository
                .findByUserAndUsageTypeAndUsageDate(user, usageType, LocalDate.now())
                .map(UsageTracking::getCount)
                .orElse(0);
    }
}
