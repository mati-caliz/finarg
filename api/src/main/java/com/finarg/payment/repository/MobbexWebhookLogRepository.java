package com.finarg.payment.repository;

import com.finarg.payment.entity.MobbexWebhookLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MobbexWebhookLogRepository extends JpaRepository<MobbexWebhookLog, Long> {

    boolean existsByWebhookId(String webhookId);
}
