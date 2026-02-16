ALTER TABLE subscriptions
  RENAME COLUMN mercadopago_subscription_id TO mobbex_subscriber_id;

ALTER TABLE subscriptions
  ADD COLUMN mobbex_execution_id VARCHAR(255),
  ADD COLUMN last_payment_date TIMESTAMP,
  ADD COLUMN next_billing_date TIMESTAMP;

CREATE TABLE mobbex_webhook_log (
  id BIGSERIAL PRIMARY KEY,
  webhook_id VARCHAR(255) UNIQUE NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  subscriber_id VARCHAR(255),
  execution_id VARCHAR(255),
  status VARCHAR(50),
  processed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  raw_payload JSONB NOT NULL
);

CREATE INDEX idx_webhook_id ON mobbex_webhook_log(webhook_id);
CREATE INDEX idx_subscriber_id ON mobbex_webhook_log(subscriber_id);
