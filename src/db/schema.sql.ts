/* Generated from drizzle/ — kept idempotent so first request can bootstrap the schema. */
export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS "admin_chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"changes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);;
CREATE TABLE IF NOT EXISTS "agent_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" integer NOT NULL,
	"direction" text NOT NULL,
	"contact" text NOT NULL,
	"contact_name" text DEFAULT '' NOT NULL,
	"body" text NOT NULL,
	"status" text DEFAULT 'received' NOT NULL,
	"source" text DEFAULT 'webhook' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);;
CREATE TABLE IF NOT EXISTS "agent_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" integer NOT NULL,
	"type" text NOT NULL,
	"contact" text DEFAULT '' NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" text DEFAULT 'completed' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);;
CREATE TABLE IF NOT EXISTS "integrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"provider" text NOT NULL,
	"connected" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);;
CREATE TABLE IF NOT EXISTS "project_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);;
CREATE TABLE IF NOT EXISTS "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"prompt" text NOT NULL,
	"category" text DEFAULT 'Apps' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"visits" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);;
CREATE TABLE IF NOT EXISTS "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"expires_at" timestamp NOT NULL
);;
CREATE TABLE IF NOT EXISTS "site_content" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);;
CREATE TABLE IF NOT EXISTS "site_content_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"summary" text DEFAULT '' NOT NULL,
	"snapshot" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);;
CREATE TABLE IF NOT EXISTS "superagents" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"role" text DEFAULT 'customer_support' NOT NULL,
	"system_prompt" text NOT NULL,
	"model" text DEFAULT 'gpt-4o-mini' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"channel" text DEFAULT 'whatsapp' NOT NULL,
	"phone_number_id" text DEFAULT '' NOT NULL,
	"business_account_id" text DEFAULT '' NOT NULL,
	"access_token" text DEFAULT '' NOT NULL,
	"verify_token" text NOT NULL,
	"app_secret" text DEFAULT '' NOT NULL,
	"webhook_verified_at" timestamp,
	"tools" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"escalation_keywords" text DEFAULT 'human, agent, manager' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);;
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"password_hash" text NOT NULL,
	"plan" text DEFAULT 'free' NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"api_key" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);;
CREATE UNIQUE INDEX IF NOT EXISTS "integrations_user_provider" ON "integrations" USING btree ("user_id","provider");
`;
