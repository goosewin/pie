import { relations, sql } from "drizzle-orm";
import {
  integer,
  jsonb,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp
} from "drizzle-orm/pg-core";

// Define a schema if you want to namespace your tables
// export const mySchema = pgSchema("my_schema");

// Define the type for the chart data stored in JSONB
// You might want to refine this type based on your actual chart data structure
export type ChartData = {
  activities: { id: string; name: string; value: number; color: string }[];
  mode: "hours" | "percentage";
  // Add any other metadata you want to store
};

export const charts = pgTable("charts", {
  id: serial("id").primaryKey(), // Auto-incrementing integer ID (numeric)
  userId: text("user_id"), // Nullable text field for authenticated user ID (e.g., from BetterAuth session)
  guestIdentifier: text("guest_identifier"), // Nullable text field for guest identifier (e.g., userAgentHash or session ID)
  chartData: jsonb("chart_data").notNull().$type<ChartData>(), // The chart configuration data
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(), // Timestamp of creation
});

// Example of how you might add a check constraint if needed:
// import { check } from "drizzle-orm/pg-core";
// export const charts = pgTable("charts", {
//   ...
// }, (table) => ({
//   // Ensure that either userId or guestIdentifier is populated
//   identifierCheck: check('identifier_check', sql`user_id IS NOT NULL OR guest_identifier IS NOT NULL`),
// }));

// You might define relations here if you have a users table
// import { relations } from 'drizzle-orm';
// import { users } from './users'; // Assuming you have a users schema
//
// export const chartsRelations = relations(charts, ({ one }) => ({
//  user: one(users, {
//    fields: [charts.userId],
//    references: [users.id],
//  }),
// }));

// --- BetterAuth Core Schema (required for Drizzle adapter and FKs) ---
// Based on common BetterAuth Drizzle adapter requirements

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Typically UUID or similar from Auth provider
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date", withTimezone: true }),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // e.g., "oauth", "email"
    provider: text("provider").notNull(), // e.g., "google", "github", "credentials"
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
    // Add other fields specific to providers if needed
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date", withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- Relations (Optional but recommended for Drizzle) --- 

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  charts: many(charts), // User can have multiple charts
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const chartsRelations = relations(charts, ({ one }) => ({
  user: one(users, {
    fields: [charts.userId],
    references: [users.id],
  }),
})); 
