package com.finarg.subscription.repository;

import com.finarg.subscription.entity.Subscription;
import com.finarg.subscription.model.SubscriptionStatus;
import com.finarg.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    Optional<Subscription> findTopByUserAndStatusOrderByEndDateDesc(User user, SubscriptionStatus status);

    Optional<Subscription> findByMobbexSubscriberId(String mobbexSubscriberId);

}
