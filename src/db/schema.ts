import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  bigint,
  boolean,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/* ------------------------------------------------------------------ */
/* Enums                                                               */
/* ------------------------------------------------------------------ */

export const deliveryStatus = pgEnum("delivery_status", [
  "draft",
  "sent",
  "revoked",
]);

/**
 * Resolve-aware classification, derived from the file extension at upload
 * time. Purely cosmetic -- it drives the label and icon on the recipient
 * page so a client can tell a project file from a LUT at a glance.
 */
export const fileKind = pgEnum("file_kind", [
  "project", // .drp
  "timeline", // .drt
  "grade", // .drx
  "effect", // .drfx
  "lut", // .cube
  "archive", // .dra (zipped), .zip
  "other",
]);

export const accessEventType = pgEnum("access_event_type", [
  "viewed",
  "unlocked",
  "download_file",
  "download_all",
  "denied",
]);

/* ------------------------------------------------------------------ */
/* Studio side                                                         */
/* ------------------------------------------------------------------ */

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(), // sha256 of the cookie value
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  contactEmail: text("contact_email"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* ------------------------------------------------------------------ */
/* Deliveries                                                          */
/* ------------------------------------------------------------------ */

export const deliveries = pgTable(
  "deliveries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "restrict" }),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),

    title: text("title").notNull(),
    message: text("message"),

    /**
     * Optional handoff notes. You fill these in if you want them; leave them
     * blank and they simply don't render on the recipient page.
     */
    resolveVersion: text("resolve_version"),
    studioRequired: boolean("studio_required").notNull().default(false),

    status: deliveryStatus("status").notNull().default("draft"),

    /** sha256 of the share token -- the indexed lookup key. */
    tokenHash: text("token_hash").notNull().unique(),
    /**
     * The same token sealed with SESSION_SECRET so the dashboard can show the
     * link again later. A database leak on its own does not yield working
     * share links; an application compromise does.
     */
    tokenSealed: text("token_sealed").notNull(),
    /** Optional second factor on the share link. */
    passwordHash: text("password_hash"),

    expiresAt: timestamp("expires_at", { withTimezone: true }),
    maxDownloads: integer("max_downloads"),
    downloadCount: integer("download_count").notNull().default(0),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
  },
  (t) => [
    index("deliveries_client_idx").on(t.clientId),
    index("deliveries_created_idx").on(t.createdAt),
  ],
);

export const deliveryFiles = pgTable(
  "delivery_files",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    deliveryId: uuid("delivery_id")
      .notNull()
      .references(() => deliveries.id, { onDelete: "cascade" }),

    filename: text("filename").notNull(),
    kind: fileKind("kind").notNull().default("other"),
    sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
    /** Computed in the browser before upload. Null for very large files. */
    sha256: text("sha256"),

    storageKey: text("storage_key").notNull(),
    /** Flips to true once the browser confirms the PUT succeeded. */
    uploaded: boolean("uploaded").notNull().default(false),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("delivery_files_delivery_idx").on(t.deliveryId)],
);

/* ------------------------------------------------------------------ */
/* Audit trail                                                         */
/* ------------------------------------------------------------------ */

export const accessEvents = pgTable(
  "access_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    deliveryId: uuid("delivery_id")
      .notNull()
      .references(() => deliveries.id, { onDelete: "cascade" }),
    fileId: uuid("file_id").references(() => deliveryFiles.id, {
      onDelete: "set null",
    }),
    type: accessEventType("type").notNull(),
    /** Recorded for the audit trail; see README on retention. */
    ip: text("ip"),
    userAgent: text("user_agent"),
    detail: text("detail"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("access_events_delivery_idx").on(t.deliveryId, t.createdAt)],
);

/* ------------------------------------------------------------------ */
/* Relations                                                           */
/* ------------------------------------------------------------------ */

export const clientsRelations = relations(clients, ({ many }) => ({
  deliveries: many(deliveries),
}));

export const deliveriesRelations = relations(deliveries, ({ one, many }) => ({
  client: one(clients, {
    fields: [deliveries.clientId],
    references: [clients.id],
  }),
  author: one(users, {
    fields: [deliveries.createdBy],
    references: [users.id],
  }),
  files: many(deliveryFiles),
  events: many(accessEvents),
}));

export const deliveryFilesRelations = relations(deliveryFiles, ({ one }) => ({
  delivery: one(deliveries, {
    fields: [deliveryFiles.deliveryId],
    references: [deliveries.id],
  }),
}));

export const accessEventsRelations = relations(accessEvents, ({ one }) => ({
  delivery: one(deliveries, {
    fields: [accessEvents.deliveryId],
    references: [deliveries.id],
  }),
  file: one(deliveryFiles, {
    fields: [accessEvents.fileId],
    references: [deliveryFiles.id],
  }),
}));

export type Delivery = typeof deliveries.$inferSelect;
export type DeliveryFile = typeof deliveryFiles.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type User = typeof users.$inferSelect;
export type AccessEvent = typeof accessEvents.$inferSelect;
