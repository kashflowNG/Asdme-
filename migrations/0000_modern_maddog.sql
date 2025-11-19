CREATE TABLE "content_blocks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" varchar NOT NULL,
	"type" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"title" text,
	"content" text,
	"media_url" text,
	"thumbnail_url" text,
	"is_visible" integer DEFAULT 1 NOT NULL,
	"settings" text
);
--> statement-breakpoint
CREATE TABLE "form_submissions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" varchar NOT NULL,
	"block_id" varchar,
	"email" text,
	"name" text,
	"phone" text,
	"message" text,
	"custom_fields" text,
	"timestamp" text NOT NULL,
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "link_clicks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"link_id" varchar NOT NULL,
	"timestamp" text NOT NULL,
	"user_agent" text,
	"referrer" text
);
--> statement-breakpoint
CREATE TABLE "link_groups" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" varchar NOT NULL,
	"name" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"is_collapsed" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_views" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" varchar NOT NULL,
	"timestamp" text NOT NULL,
	"user_agent" text,
	"referrer" text
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"bio" text DEFAULT '',
	"avatar" text DEFAULT '',
	"theme" text DEFAULT 'neon',
	"primary_color" text DEFAULT '#8B5CF6',
	"background_color" text DEFAULT '#0A0A0F',
	"views" integer DEFAULT 0 NOT NULL,
	"background_image" text,
	"background_video" text,
	"background_type" text DEFAULT 'color',
	"custom_css" text,
	"layout" text DEFAULT 'stacked',
	"font_family" text DEFAULT 'DM Sans',
	"button_style" text DEFAULT 'rounded',
	"seo_title" text,
	"seo_description" text,
	"og_image" text,
	"custom_domain" text,
	"hide_branding" integer DEFAULT 0 NOT NULL,
	"verification_badge" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "profiles_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "social_links" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" varchar NOT NULL,
	"platform" text NOT NULL,
	"url" text NOT NULL,
	"custom_title" text,
	"order" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"is_scheduled" integer DEFAULT 0 NOT NULL,
	"schedule_start" text,
	"schedule_end" text,
	"thumbnail" text,
	"group_id" varchar,
	"is_priority" integer DEFAULT 0 NOT NULL,
	"badge" text,
	"description" text
);
