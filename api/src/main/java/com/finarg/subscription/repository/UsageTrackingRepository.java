package com.finarg.subscription.repository;

import com.finarg.subscription.entity.UsageTracking;
import com.finarg.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface UsageTrackingRepository extends JpaRepository<UsageTracking, Long> {

    Optional<UsageTracking> findByUserAndUsageTypeAndUsageDate(
            User user,
            UsageTracking.UsageType usageType,
            LocalDate usageDate
    );
}
