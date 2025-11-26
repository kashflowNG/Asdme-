import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`now()`),
});

export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  username: text("username").notNull().unique(),
  bio: text("bio").default(""),
  avatar: text("avatar").default(""),
  coverPhoto: text("cover_photo"),
  theme: text("theme").default("neon"),
  primaryColor: text("primary_color").default("#8B5CF6"),
  backgroundColor: text("background_color").default("#0A0A0F"),
  views: integer("views").notNull().default(0),
  
  // Advanced Appearance
  backgroundImage: text("background_image"),
  backgroundVideo: text("background_video"),
  backgroundType: text("background_type").default("color"),
  customCSS: text("custom_css"),
  layout: text("layout").default("stacked"),
  fontFamily: text("font_family").default("DM Sans"),
  buttonStyle: text("button_style").default("rounded"),
  
  // Applied Theme Template
  appliedTemplateId: varchar("applied_template_id"),
  
  // SEO & Metadata
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  ogImage: text("og_image"),
  
  // About & Business
  aboutMe: text("about_me"),
  businessInfo: text("business_info"),
  
  // Branding
  customDomain: text("custom_domain"),
  hideBranding: boolean("hide_branding").notNull().default(false),
  verificationBadge: boolean("verification_badge").notNull().default(false),
});

export const linkGroups = pgTable("link_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").notNull(),
  name: text("name").notNull(),
  order: integer("order").notNull().default(0),
  isCollapsed: boolean("is_collapsed").notNull().default(false),
});

export const socialLinks = pgTable("social_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").notNull(),
  platform: text("platform").notNull(),
  url: text("url").notNull(),
  customTitle: text("custom_title"),
  order: integer("order").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  isScheduled: boolean("is_scheduled").notNull().default(false),
  scheduleStart: text("schedule_start"),
  scheduleEnd: text("schedule_end"),
  thumbnail: text("thumbnail"),
  enabled: boolean("enabled").notNull().default(true),
  
  // Enhanced Features
  groupId: varchar("group_id"),
  isPriority: boolean("is_priority").notNull().default(false),
  badge: text("badge"),
  description: text("description"),
});

export const linkClicks = pgTable("link_clicks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  linkId: varchar("link_id").notNull(),
  timestamp: text("timestamp").notNull(),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
});

export const profileViews = pgTable("profile_views", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").notNull(),
  timestamp: text("timestamp").notNull(),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  ipAddress: text("ip_address"),
  country: text("country"),
  city: text("city"),
});

export const contentBlocks = pgTable("content_blocks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").notNull(),
  type: text("type").notNull(),
  order: integer("order").notNull().default(0),
  
  // Generic Content
  title: text("title"),
  content: text("content"),
  
  // Media
  mediaUrl: text("media_url"),
  thumbnailUrl: text("thumbnail_url"),
  
  // Settings
  isVisible: boolean("is_visible").notNull().default(true),
  settings: text("settings"),
});

export const formSubmissions = pgTable("form_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").notNull(),
  blockId: varchar("block_id"),
  
  // Submission Data
  email: text("email"),
  name: text("name"),
  phone: text("phone"),
  message: text("message"),
  customFields: text("custom_fields"),
  
  timestamp: text("timestamp").notNull(),
  userAgent: text("user_agent"),
});

export const readyMadeTemplates = pgTable("ready_made_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  htmlContent: text("html_content").notNull(),
  preview: text("preview"),
  badge: text("badge"),
  badgeColor: text("badge_color").default("#8B5CF6"),
  createdBy: varchar("created_by").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  category: text("category").default("general"),
  createdAt: text("created_at").notNull().default(sql`now()`),
  updatedAt: text("updated_at").notNull().default(sql`now()`),
  usageCount: integer("usage_count").notNull().default(0),
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
});

export const updateProfileSchema = z.object({
  username: z.string().trim().min(1).optional(),
  bio: z.string().optional(),
  avatar: z.string().optional(),
  coverPhoto: z.string().optional(),
  theme: z.string().optional(),
  primaryColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  
  // Advanced Appearance
  backgroundImage: z.string().optional(),
  backgroundVideo: z.string().optional(),
  backgroundType: z.string().optional(),
  customCSS: z.string().optional(),
  layout: z.string().optional(),
  fontFamily: z.string().optional(),
  buttonStyle: z.string().optional(),
  
  // Custom Template
  templateHTML: z.string().optional(),
  useCustomTemplate: z.boolean().optional(),
  appliedTemplateId: z.string().optional(),
  
  // SEO
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  ogImage: z.string().optional(),
  
  // About & Business
  aboutMe: z.string().optional(),
  businessInfo: z.string().optional(),
  
  // Branding
  customDomain: z.string().optional(),
  hideBranding: z.boolean().optional(),
  verificationBadge: z.boolean().optional(),
});

export const insertSocialLinkSchema = createInsertSchema(socialLinks).omit({
  id: true,
});

export const updateSocialLinkSchema = z.object({
  platform: z.string().optional(),
  url: z.string().optional(),
  customTitle: z.string().optional(),
  badge: z.string().optional(),
  description: z.string().optional(),
  enabled: z.boolean().optional(),
  isScheduled: z.boolean().optional(),
  scheduleStart: z.string().optional(),
  scheduleEnd: z.string().optional(),
  isPriority: z.boolean().optional(),
  groupId: z.string().optional(),
});

export const insertLinkGroupSchema = createInsertSchema(linkGroups).omit({
  id: true,
});

export const insertContentBlockSchema = createInsertSchema(contentBlocks).omit({
  id: true,
});

export const insertFormSubmissionSchema = createInsertSchema(formSubmissions).omit({
  id: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const signupSchema = z.object({
  username: z.string().trim().min(3, "Username must be at least 3 characters").max(30, "Username must be at most 30 characters").regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type SignupData = z.infer<typeof signupSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type User = typeof users.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
export type Profile = typeof profiles.$inferSelect;
export type InsertSocialLink = z.infer<typeof insertSocialLinkSchema>;
export type UpdateSocialLink = z.infer<typeof updateSocialLinkSchema>;
export type SocialLink = typeof socialLinks.$inferSelect;
export type LinkClick = typeof linkClicks.$inferSelect;
export type ProfileView = typeof profileViews.$inferSelect;
export type LinkGroup = typeof linkGroups.$inferSelect;
export type InsertLinkGroup = z.infer<typeof insertLinkGroupSchema>;
export type ContentBlock = typeof contentBlocks.$inferSelect;
export type InsertContentBlock = z.infer<typeof insertContentBlockSchema>;
export type FormSubmission = typeof formSubmissions.$inferSelect;
export type InsertFormSubmission = z.infer<typeof insertFormSubmissionSchema>;
export type ReadyMadeTemplate = typeof readyMadeTemplates.$inferSelect;

export const insertReadyMadeTemplateSchema = createInsertSchema(readyMadeTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  usageCount: true,
});

export type InsertReadyMadeTemplate = z.infer<typeof insertReadyMadeTemplateSchema>;
