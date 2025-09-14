-- Option A: Minimal schema changes to align makrx-events code with DB

-- events: add extended fields
ALTER TABLE events ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS short_description text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS type varchar;
ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_fee numeric;
ALTER TABLE events ADD COLUMN IF NOT EXISTS max_attendees integer;
ALTER TABLE events ADD COLUMN IF NOT EXISTS featured_image text;

-- event_registrations: add type and convert metadata to jsonb
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS type varchar;
ALTER TABLE event_registrations
  ALTER COLUMN metadata TYPE jsonb
  USING CASE WHEN metadata IS NULL OR metadata = '' THEN '{}'::jsonb ELSE metadata::jsonb END;

-- payment_transactions: add columns used by app
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS event_id varchar;
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS user_id varchar;
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS currency varchar;
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS payment_method varchar;
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS transaction_id varchar;
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS gateway_order_id varchar;
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS gateway_payment_id varchar;
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS completed_at timestamp;
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS error text;
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS metadata jsonb;

-- email_templates: optional rich content fields
ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS html_content text;
ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS text_content text;

-- email_queue: align to richer queue structure
ALTER TABLE email_queue ADD COLUMN IF NOT EXISTS recipient text;
ALTER TABLE email_queue ADD COLUMN IF NOT EXISTS html_content text;
ALTER TABLE email_queue ADD COLUMN IF NOT EXISTS text_content text;
ALTER TABLE email_queue ADD COLUMN IF NOT EXISTS template_id varchar;
ALTER TABLE email_queue ADD COLUMN IF NOT EXISTS priority integer DEFAULT 5;
ALTER TABLE email_queue ADD COLUMN IF NOT EXISTS scheduled_for timestamp;
ALTER TABLE email_queue ADD COLUMN IF NOT EXISTS attempts integer DEFAULT 0;
ALTER TABLE email_queue ADD COLUMN IF NOT EXISTS error text;
ALTER TABLE email_queue ADD COLUMN IF NOT EXISTS metadata jsonb;

-- livestreams: viewer count used in dashboards
ALTER TABLE livestreams ADD COLUMN IF NOT EXISTS viewer_count integer DEFAULT 0;

-- user_activities: convert metadata to jsonb
ALTER TABLE user_activities
  ALTER COLUMN metadata TYPE jsonb
  USING CASE WHEN metadata IS NULL OR metadata = '' THEN '{}'::jsonb ELSE metadata::jsonb END;

