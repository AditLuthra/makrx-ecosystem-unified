// Migration script for aligning DB schema with packages/shared/src/schema.ts
// Use with Drizzle Kit or your preferred migration tool
// This script assumes you are using PostgreSQL

import { sql } from "drizzle-orm";
import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder) {
  // --- Payment Transactions ---
  pgm.addColumn("payment_transactions", {
    event_id: { type: "varchar(255)" },
    user_id: { type: "varchar(255)" },
    currency: { type: "varchar(32)" },
    payment_method: { type: "varchar(64)" },
    transaction_id: { type: "varchar(255)" },
    gateway_order_id: { type: "varchar(255)" },
    gateway_payment_id: { type: "varchar(255)" },
    completed_at: { type: "timestamp" },
    error: { type: "text" },
    metadata: { type: "jsonb" },
  });

  // --- Event Registrations ---
  pgm.addColumn("event_registrations", {
    type: { type: "varchar(64)" },
    payment_intent_id: { type: "varchar(255)" },
    paid_at: { type: "timestamp" },
    checked_in_at: { type: "timestamp" },
    participant_info: { type: "text" },
    answers: { type: "text" },
    terms_accepted: { type: "boolean", default: false },
    marketing_consent: { type: "boolean", default: false },
    amount_paid: { type: "numeric" },
    payment_status: { type: "varchar(32)" },
    registered_at: { type: "timestamp", default: sql`now()` },
    metadata: { type: "jsonb" },
  });

  // --- Email Templates ---
  pgm.addColumn("email_templates", {
    html_content: { type: "text" },
    text_content: { type: "text" },
  });

  // --- Email Queue ---
  pgm.addColumn("email_queue", {
    recipient: { type: "text" },
    html_content: { type: "text" },
    text_content: { type: "text" },
    template_id: { type: "varchar(255)" },
    priority: { type: "integer", default: 5 },
    status: { type: "varchar(32)", default: "pending" },
    scheduled_for: { type: "timestamp" },
    attempts: { type: "integer", default: 0 },
    sent_at: { type: "timestamp" },
    error: { type: "text" },
    metadata: { type: "jsonb" },
  });
}

export async function down(pgm: MigrationBuilder) {
  // Remove columns if rolling back
  pgm.dropColumns("payment_transactions", [
    "event_id",
    "user_id",
    "currency",
    "payment_method",
    "transaction_id",
    "gateway_order_id",
    "gateway_payment_id",
    "completed_at",
    "error",
    "metadata",
  ]);
  pgm.dropColumns("event_registrations", [
    "type",
    "payment_intent_id",
    "paid_at",
    "checked_in_at",
    "participant_info",
    "answers",
    "terms_accepted",
    "marketing_consent",
    "amount_paid",
    "payment_status",
    "registered_at",
    "metadata",
  ]);
  pgm.dropColumns("email_templates", ["html_content", "text_content"]);
  pgm.dropColumns("email_queue", [
    "recipient",
    "html_content",
    "text_content",
    "template_id",
    "priority",
    "status",
    "scheduled_for",
    "attempts",
    "sent_at",
    "error",
    "metadata",
  ]);
}
