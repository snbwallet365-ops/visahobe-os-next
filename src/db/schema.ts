import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull().default(""),
  passwordHash: text("password_hash").notNull(),
  plan: text("plan").notNull().default("free"),
  role: text("role").notNull().default("user"),
  apiKey: text("api_key").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  prompt: text("prompt").notNull(),
  category: text("category").notNull().default("Apps"),
  status: text("status").notNull().default("draft"),
  published: boolean("published").notNull().default(false),
  visits: integer("visits").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const projectMessages = pgTable("project_messages", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const superagents = pgTable("superagents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  role: text("role").notNull().default("customer_support"),
  systemPrompt: text("system_prompt").notNull(),
  model: text("model").notNull().default("gpt-4o-mini"),
  status: text("status").notNull().default("active"),
  channel: text("channel").notNull().default("whatsapp"),
  phoneNumberId: text("phone_number_id").notNull().default(""),
  businessAccountId: text("business_account_id").notNull().default(""),
  accessToken: text("access_token").notNull().default(""),
  verifyToken: text("verify_token").notNull(),
  appSecret: text("app_secret").notNull().default(""),
  webhookVerifiedAt: timestamp("webhook_verified_at"),
  tools: jsonb("tools").$type<string[]>().notNull().default([]),
  escalationKeywords: text("escalation_keywords").notNull().default("human, agent, manager"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const agentMessages = pgTable("agent_messages", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id")
    .notNull()
    .references(() => superagents.id, { onDelete: "cascade" }),
  direction: text("direction").notNull(),
  contact: text("contact").notNull(),
  contactName: text("contact_name").notNull().default(""),
  body: text("body").notNull(),
  status: text("status").notNull().default("received"),
  source: text("source").notNull().default("webhook"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const agentTasks = pgTable("agent_tasks", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id")
    .notNull()
    .references(() => superagents.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  contact: text("contact").notNull().default(""),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
  status: text("status").notNull().default("completed"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const integrations = pgTable(
  "integrations",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    connected: boolean("connected").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("integrations_user_provider").on(t.userId, t.provider)],
);

export const siteContent = pgTable("site_content", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const siteContentHistory = pgTable("site_content_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  summary: text("summary").notNull().default(""),
  snapshot: jsonb("snapshot").$type<Record<string, string>>().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const adminChatMessages = pgTable("admin_chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  changes: jsonb("changes").$type<Record<string, string>>().notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Superagent = typeof superagents.$inferSelect;
export type AgentMessage = typeof agentMessages.$inferSelect;
export type AgentTask = typeof agentTasks.$inferSelect;
