import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  bio: text("bio").default(""),
  avatar: text("avatar").default(""),
});

export const socialLinks = pgTable("social_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").notNull(),
  platform: text("platform").notNull(),
  url: text("url").notNull(),
  customTitle: text("custom_title"),
  order: integer("order").notNull().default(0),
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
});

export const updateProfileSchema = z.object({
  username: z.string().trim().min(1).optional(),
  bio: z.string().optional(),
  avatar: z.string().optional(),
});

export const insertSocialLinkSchema = createInsertSchema(socialLinks).omit({
  id: true,
});

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
export type Profile = typeof profiles.$inferSelect;
export type InsertSocialLink = z.infer<typeof insertSocialLinkSchema>;
export type SocialLink = typeof socialLinks.$inferSelect;
