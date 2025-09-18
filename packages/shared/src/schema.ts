import { sql } from "drizzle-orm";
import {
  pgTable,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  numeric,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username"),
  email: text("email"),
  keycloakId: varchar("keycloak_id"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  role: varchar("role").default("user"),
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
export type User = typeof users.$inferSelect;
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
}) as unknown as z.ZodTypeAny;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Events
export const events = pgTable("events", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  slug: text("slug").notNull(),
  title: text("title"),
  organizerId: varchar("organizer_id"),
  status: varchar("status").default("draft"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  // Extended fields used by makrx-events app
  description: text("description"),
  shortDescription: text("short_description"),
  location: text("location"),
  type: varchar("type"),
  registrationFee: numeric("registration_fee"),
  maxAttendees: integer("max_attendees"),
  featuredImage: text("featured_image"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
export type Event = typeof events.$inferSelect;
export const insertEventSchema = createInsertSchema(events).pick({
  slug: true,
  title: true,
  organizerId: true,
  status: true,
  startDate: true,
  endDate: true,
}) as unknown as z.ZodTypeAny;
export type InsertEvent = z.infer<typeof insertEventSchema>;

// Microsites and sub-events
export const microsites = pgTable("microsites", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  description: text("description"),
  status: varchar("status").default("draft"),
  visibility: varchar("visibility").default("private"),
  hostType: varchar("host_type"),
  hostRef: varchar("host_ref"),
  organizer: text("organizer"),
  website: text("website"),
  heroImage: text("hero_image"),
  location: text("location"),
  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at"),
  templateId: varchar("template_id"),
  themeId: varchar("theme_id"),
  highlights: jsonb("highlights"),
  settings: jsonb("settings"),
  seo: jsonb("seo"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  publishedAt: timestamp("published_at"),
});
export type Microsite = typeof microsites.$inferSelect;
const baseMicrositeInsertSchema = createInsertSchema(microsites, {
  startsAt: (field) => field.optional(),
  endsAt: (field) => field.optional(),
  highlights: (field) => field.optional(),
  settings: (field) => field.optional(),
  seo: (field) => field.optional(),
});
export const insertMicrositeSchema = baseMicrositeInsertSchema.extend({
  slug: baseMicrositeInsertSchema.shape.slug.optional(),
}) as unknown as z.ZodTypeAny;
export type InsertMicrosite = z.infer<typeof insertMicrositeSchema>;

export const micrositeSections = pgTable("microsite_sections", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  micrositeId: varchar("microsite_id").notNull(),
  type: varchar("type").notNull(),
  order: integer("order").default(0),
  isVisible: boolean("is_visible").default(true),
  contentJson: jsonb("content_json"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
export type MicrositeSection = typeof micrositeSections.$inferSelect;
const baseMicrositeSectionInsertSchema = createInsertSchema(micrositeSections, {
  order: (field) => field.optional(),
  isVisible: (field) => field.optional(),
  contentJson: (field) => field.optional(),
});
export const insertPageSectionSchema = baseMicrositeSectionInsertSchema as unknown as z.ZodTypeAny;
export type InsertMicrositeSection = z.infer<typeof insertPageSectionSchema>;

export const subEvents = pgTable("sub_events", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  micrositeId: varchar("microsite_id").notNull(),
  title: text("title").notNull(),
  type: varchar("type"),
  capacity: integer("capacity"),
  price: numeric("price"),
  currency: varchar("currency"),
  registrationType: varchar("registration_type"),
  status: varchar("status").default("draft"),
  registrationDeadline: timestamp("registration_deadline"),
  startsAt: timestamp("starts_at"),
  location: text("location"),
});

// Event Features
export const eventFeatures = pgTable("event_features", {
  eventId: varchar("event_id").primaryKey(),
  enableTeams: boolean("enable_teams").default(false),
  enableSponsors: boolean("enable_sponsors").default(false),
  enableTournaments: boolean("enable_tournaments").default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
});
export type EventFeatures = typeof eventFeatures.$inferSelect;
export const insertEventFeaturesSchema = createInsertSchema(
  eventFeatures,
) as unknown as z.ZodTypeAny;
export type InsertEventFeatures = z.infer<typeof insertEventFeaturesSchema>;

// Registrations
export const eventRegistrations = pgTable("event_registrations", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  eventId: varchar("event_id"),
  micrositeId: varchar("microsite_id"),
  subEventId: varchar("sub_event_id"),
  userId: varchar("user_id").notNull(),
  type: varchar("type"),
  status: varchar("status").default("confirmed"),
  paymentIntentId: varchar("payment_intent_id"),
  paidAt: timestamp("paid_at"),
  checkedInAt: timestamp("checked_in_at"),
  participantInfo: text("participant_info"),
  answers: text("answers"),
  termsAccepted: boolean("terms_accepted").default(false),
  marketingConsent: boolean("marketing_consent").default(false),
  amountPaid: numeric("amount_paid"),
  paymentStatus: varchar("payment_status"),
  registeredAt: timestamp("registered_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: jsonb("metadata"),
});
export type EventRegistration = typeof eventRegistrations.$inferSelect;
export const insertRegistrationSchema = createInsertSchema(
  eventRegistrations,
).pick({
  eventId: true,
  userId: true,
  status: true,
}) as unknown as z.ZodTypeAny;
export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;

// Alias used in some routes
export const registrations = eventRegistrations;

// Activities (user activity stream)
export const userActivities = pgTable("user_activities", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  eventId: varchar("event_id"),
  activity: varchar("activity").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});
export type Activity = typeof userActivities.$inferSelect;
export const insertActivitySchema = createInsertSchema(userActivities).pick({
  userId: true,
  eventId: true,
  activity: true,
}) as unknown as z.ZodTypeAny;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

// Teams and members (basic)
export const teams = pgTable("teams", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
export const teamMembers = pgTable("team_members", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").notNull(),
  userId: varchar("user_id").notNull(),
  role: varchar("role").default("member"),
});

// Tournaments (minimal)
export const tournaments = pgTable("tournaments", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull(),
  name: text("name").notNull(),
});

// Sponsors (minimal)
export const sponsors = pgTable("sponsors", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull(),
  name: text("name").notNull(),
  tier: varchar("tier"),
});

// Payment transactions (minimal)
export const paymentTransactions = pgTable("payment_transactions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  registrationId: varchar("registration_id").notNull(),
  eventId: varchar("event_id"),
  userId: varchar("user_id"),
  amount: numeric("amount").notNull(),
  currency: varchar("currency"),
  status: varchar("status").default("pending"),
  paymentMethod: varchar("payment_method"),
  transactionId: varchar("transaction_id"),
  gatewayOrderId: varchar("gateway_order_id"),
  gatewayPaymentId: varchar("gateway_payment_id"),
  completedAt: timestamp("completed_at"),
  error: text("error"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// QR codes and check-ins (minimal)
export const qrCodes = pgTable("qr_codes", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull(),
  sessionId: varchar("session_id"),
  userId: varchar("user_id"),
  code: text("code").notNull(),
  type: varchar("type").default("ticket"),
  status: varchar("status").default("active"),
  expiresAt: timestamp("expires_at"),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});
export const eventCheckIns = pgTable("event_check_ins", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull(),
  userId: varchar("user_id").notNull(),
  checkedInBy: varchar("checked_in_by"),
  notes: text("notes"),
  checkedInAt: timestamp("checked_in_at").defaultNow(),
});

// Push subscriptions and live announcements (minimal)
export const pushSubscriptions = pgTable("push_subscriptions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
});
export const liveAnnouncements = pgTable("live_announcements", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Email templates and queue (minimal)
export const emailTemplates = pgTable("email_templates", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  key: text("key").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  htmlContent: text("html_content"),
  textContent: text("text_content"),
});
export const emailQueue = pgTable("email_queue", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  to: text("to"),
  recipient: text("recipient"),
  eventId: varchar("event_id"),
  userId: varchar("user_id"),
  subject: text("subject").notNull(),
  body: text("body"),
  htmlContent: text("html_content"),
  textContent: text("text_content"),
  templateId: varchar("template_id"),
  priority: integer("priority").default(5),
  status: varchar("status").default("pending"),
  scheduledFor: timestamp("scheduled_for"),
  attempts: integer("attempts").default(0),
  sentAt: timestamp("sent_at"),
  error: text("error"),
  metadata: jsonb("metadata"),
});

// Admin applications (minimal)
export const adminApplications = pgTable("admin_applications", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  status: varchar("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Event templates (minimal)
export const eventTemplates = pgTable("event_templates", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  createdBy: varchar("created_by"),
  category: varchar("category"),
  isPublic: boolean("is_public").default(false),
  usageCount: integer("usage_count").default(0),
  tags: text("tags"),
  templateData: text("template_data"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sessions and related aggregates used in dashboards (minimal)
export const eventSessions = pgTable("event_sessions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull(),
  title: text("title"),
  startsAt: timestamp("starts_at"),
});

export const sessionRegistrations = pgTable("session_registrations", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  userId: varchar("user_id").notNull(),
  registeredAt: timestamp("registered_at").defaultNow(),
});

export const livestreams = pgTable("livestreams", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull(),
  platform: varchar("platform"),
  url: text("url"),
  status: varchar("status").default("scheduled"),
  viewerCount: integer("viewer_count").default(0),
});

// Microsite registrations (minimal)
export const micrositeRegistrations = pgTable("microsite_registrations", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  micrositeSlug: text("microsite_slug").notNull(),
  userId: varchar("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Roles and other enums (minimal)
export const eventRoles = pgTable("event_roles", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull(),
  userId: varchar("user_id").notNull(),
  role: varchar("role").notNull(),
});

// Export jobs placeholder (used for exports API)
export const exportJobs = pgTable("export_jobs", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  eventId: varchar("event_id"),
  type: varchar("type"),
  status: varchar("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Misc validation-only insert schemas referenced in code
export const insertTicketingProfileSchema = z.any();
export const insertThemeSchema = z.any();
export const insertSubEventSchema = z.any();
export const insertMicrositeRegistrationSchema = z.any();
export const insertTicketTierSchema = z.any();
export const insertCouponSchema = z.any();
