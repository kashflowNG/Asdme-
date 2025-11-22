
-- Add enabled column to social_links table
ALTER TABLE "social_links" ADD COLUMN "enabled" integer DEFAULT 1 NOT NULL;
