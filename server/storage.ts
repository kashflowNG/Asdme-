import {
  type Profile, type InsertProfile,
  type SocialLink, type InsertSocialLink,
  type LinkGroup, type InsertLinkGroup,
  type ContentBlock, type InsertContentBlock,
  type FormSubmission, type InsertFormSubmission,
  type User, type InsertUser,
  type ReadyMadeTemplate, type InsertReadyMadeTemplate,
  type DailyStreak, type UserPoints, type ShopItem, type UserPurchase,
  profiles, socialLinks, linkGroups, contentBlocks, formSubmissions, linkClicks, profileViews, users, readyMadeTemplates,
  dailyStreaks, userPoints, shopItems, userPurchases, styles
} from "@shared/schema";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, sql as drizzleSql } from "drizzle-orm";
import crypto from "crypto";

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client);

export interface IStorage {
  // User methods
  createUser(user: InsertUser): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  // Profile methods
  getProfile(id: string): Promise<Profile | undefined>;
  getProfileByUsername(username: string): Promise<Profile | undefined>;
  getProfileByUserId(userId: string): Promise<Profile | undefined>;
  getProfileByCustomDomain(customDomain: string): Promise<Profile | undefined>;
  getDefaultProfile(): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(id: string, profile: Partial<Profile>): Promise<Profile | undefined>;

  // Social Link methods
  getSocialLinks(profileId: string): Promise<SocialLink[]>;
  getSocialLink(id: string): Promise<SocialLink | undefined>;
  createSocialLink(link: InsertSocialLink): Promise<SocialLink>;
  updateSocialLink(id: string, link: Partial<SocialLink>): Promise<SocialLink | undefined>;
  deleteSocialLink(id: string): Promise<boolean>;
  reorderSocialLinks(links: Array<{ id: string; order: number }>): Promise<void>;

  // Link Groups methods
  getLinkGroups(profileId: string): Promise<LinkGroup[]>;
  createLinkGroup(group: InsertLinkGroup): Promise<LinkGroup>;
  deleteLinkGroup(id: string): Promise<boolean>;

  // Content Blocks methods
  getContentBlocks(profileId: string): Promise<ContentBlock[]>;
  createContentBlock(block: InsertContentBlock): Promise<ContentBlock>;
  updateContentBlock(id: string, block: Partial<ContentBlock>): Promise<ContentBlock | undefined>;
  deleteContentBlock(id: string): Promise<boolean>;
  reorderContentBlocks(blocks: Array<{ id: string; order: number }>): Promise<void>;

  // Form Submissions methods
  getFormSubmissions(profileId: string): Promise<FormSubmission[]>;
  getFormSubmissionById(id: string): Promise<FormSubmission | undefined>;
  createFormSubmission(submission: InsertFormSubmission): Promise<FormSubmission>;
  deleteFormSubmission(id: string): Promise<boolean>;

  // Analytics methods
  trackLinkClick(linkId: string, userAgent?: string, referrer?: string): Promise<void>;
  trackProfileView(profileId: string, userAgent?: string, referrer?: string): Promise<void>;
  getLinkAnalytics(linkId: string): Promise<{ clicks: number }>;
  getProfileAnalytics(profileId: string): Promise<{ views: number; totalClicks: number; linkCount: number }>;
  getDetailedAnalytics(profileId: string): Promise<{
    totalViews: number;
    totalClicks: number;
    linkCount: number;
    formSubmissions: number;
    topLinks: Array<{ platform: string; url: string; clicks: number }>;
    recentViews: Array<{ timestamp: string; userAgent?: string; referrer?: string }>;
  }>;
}

export class DatabaseStorage implements IStorage {
  private db;

  private memoryStore: {
    users: Map<string, User>;
    profiles: Map<string, Profile>;
    socialLinks: Map<string, SocialLink>;
    linkGroups: Map<string, LinkGroup>;
    contentBlocks: Map<string, ContentBlock>;
    formSubmissions: Map<string, FormSubmission>;
    linkClicks: any[];
    profileViews: any[];
    dailyStreaks: Map<string, DailyStreak>;
    userPoints: Map<string, UserPoints>;
    shopItems: Map<string, ShopItem>;
    userPurchases: any[];
  } | null = null;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      console.log("✓ Using in-memory storage (no database required)");
      // Initialize in-memory storage
      this.memoryStore = {
        users: new Map(),
        profiles: new Map(),
        socialLinks: new Map(),
        linkGroups: new Map(),
        contentBlocks: new Map(),
        formSubmissions: new Map(),
        linkClicks: [],
        profileViews: [],
        dailyStreaks: new Map(),
        userPoints: new Map(),
        shopItems: new Map(),
        userPurchases: []
      };

      // No database setup needed
      this.db = null as any;
    } else {
      console.log("✓ Connecting to PostgreSQL database...");
      const sql = postgres(connectionString);
      this.db = drizzle(sql);
      this.initialize().catch(err => {
        console.warn("Database initialization failed:", err.message);
      });
    }
  }

  private async initialize() {
    try {
      const existingUsers = await this.db.select().from(users).limit(1);
      console.log("Database initialized successfully");
    } catch (error) {
      console.error("Failed to initialize database:", error);
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (this.memoryStore) {
      const newUser: User = {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...insertUser,
      };
      this.memoryStore.users.set(newUser.id, newUser);
      this.memoryStore.users.set(newUser.username, newUser);
      return newUser;
    }
    try {
      const result = await this.db.insert(users).values(insertUser).returning();
      return result[0];
    } catch (error) {
      console.error("createUser error:", error);
      throw new Error("Failed to create user");
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (this.memoryStore) {
      return this.memoryStore.users.get(username);
    }
    try {
      const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
      return result[0];
    } catch (error) {
      console.error("getUserByUsername error:", error);
      return undefined;
    }
  }

  async getUserById(id: string): Promise<User | undefined> {
    if (this.memoryStore) {
      return this.memoryStore.users.get(id);
    }
    try {
      const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error("getUserById error:", error);
      return undefined;
    }
  }

  async getAllUsers(): Promise<User[]> {
    if (this.memoryStore) {
      return Array.from(this.memoryStore.users.values()).filter(u => u.id?.startsWith('user-'));
    }
    try {
      return await this.db.select().from(users);
    } catch (error) {
      console.error("getAllUsers error:", error);
      return [];
    }
  }

  // Ready-Made Templates
  async createReadyMadeTemplate(template: InsertReadyMadeTemplate): Promise<ReadyMadeTemplate> {
    if (this.memoryStore) {
      const newTemplate: ReadyMadeTemplate = {
        id: `tpl-${Date.now()}`,
        ...template,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0,
      };
      (this.memoryStore as any).templates = (this.memoryStore as any).templates || new Map();
      (this.memoryStore as any).templates.set(newTemplate.id, newTemplate);
      return newTemplate;
    }
    const result = await this.db.insert(readyMadeTemplates).values(template).returning();
    return result[0];
  }

  async getReadyMadeTemplates(): Promise<ReadyMadeTemplate[]> {
    if (this.memoryStore) {
      const templates = (this.memoryStore as any).templates || new Map();
      return Array.from(templates.values());
    }
    return await this.db.select().from(readyMadeTemplates).where(eq(readyMadeTemplates.isActive, true));
  }

  async getReadyMadeTemplate(templateId: string): Promise<ReadyMadeTemplate | undefined> {
    if (this.memoryStore) {
      const templates = (this.memoryStore as any).templates || new Map();
      return templates.get(templateId);
    }
    const result = await this.db.select().from(readyMadeTemplates).where(eq(readyMadeTemplates.id, templateId)).limit(1);
    return result[0];
  }

  async updateTemplateUsage(templateId: string): Promise<void> {
    if (this.memoryStore) return;
    await this.db.update(readyMadeTemplates).set({ usageCount: drizzleSql`usage_count + 1` }).where(eq(readyMadeTemplates.id, templateId));
  }

  async updateReadyMadeTemplate(templateId: string, updates: Partial<ReadyMadeTemplate>): Promise<ReadyMadeTemplate | undefined> {
    if (this.memoryStore) {
      const templates = (this.memoryStore as any).templates || new Map();
      const template = templates.get(templateId);
      if (template) {
        const updated = { ...template, ...updates };
        templates.set(templateId, updated);
        return updated;
      }
      return undefined;
    }
    const result = await this.db.update(readyMadeTemplates).set(updates).where(eq(readyMadeTemplates.id, templateId)).returning();
    return result[0];
  }

  async deleteReadyMadeTemplate(templateId: string): Promise<boolean> {
    if (this.memoryStore) {
      const templates = (this.memoryStore as any).templates || new Map();
      return templates.delete(templateId);
    }
    const result = await this.db.delete(readyMadeTemplates).where(eq(readyMadeTemplates.id, templateId));
    return !!result;
  }

  async deleteUser(userId: string): Promise<boolean> {
    if (this.memoryStore) {
      const user = await this.getUserById(userId);
      if (user) {
        this.memoryStore.users.delete(userId);
        this.memoryStore.users.delete(user.username);
        const profile = Array.from(this.memoryStore.profiles.values()).find(p => p.userId === userId);
        if (profile) this.memoryStore.profiles.delete(profile.id);
        return true;
      }
      return false;
    }
    const userToDelete = await this.getUserById(userId);
    if (!userToDelete) return false;
    const profile = await this.getProfileByUserId(userId);
    if (profile) {
      await this.db.delete(socialLinks).where(eq(socialLinks.profileId, profile.id));
      await this.db.delete(linkGroups).where(eq(linkGroups.profileId, profile.id));
      await this.db.delete(contentBlocks).where(eq(contentBlocks.profileId, profile.id));
      await this.db.delete(linkClicks).where(eq(linkClicks.linkId, sql`(SELECT id FROM social_links WHERE profile_id = ${profile.id})`));
      await this.db.delete(profileViews).where(eq(profileViews.profileId, profile.id));
      await this.db.delete(profiles).where(eq(profiles.id, profile.id));
    }
    await this.db.delete(users).where(eq(users.id, userId));
    return true;
  }

  async getProfile(id: string): Promise<Profile | undefined> {
    if (this.memoryStore) {
      return this.memoryStore.profiles.get(id);
    }
    try {
      const result = await this.db.select().from(profiles).where(eq(profiles.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error("getProfile error:", error);
      return undefined;
    }
  }

  async getProfileByUsername(username: string): Promise<Profile | undefined> {
    if (this.memoryStore) {
      return this.memoryStore.profiles.get(username);
    }
    try {
      const result = await this.db.select().from(profiles).where(eq(profiles.username, username)).limit(1);
      return result[0];
    } catch (error) {
      console.error("getProfileByUsername error:", error);
      return undefined;
    }
  }

  async getProfileByUserId(userId: string): Promise<Profile | undefined> {
    if (this.memoryStore) {
      return Array.from(this.memoryStore.profiles.values()).find(p => p.userId === userId);
    }
    try {
      const result = await this.db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
      return result[0];
    } catch (error) {
      console.error("getProfileByUserId error:", error);
      return undefined;
    }
  }

  async getProfileByCustomDomain(customDomain: string): Promise<Profile | undefined> {
    if (this.memoryStore) {
      return Array.from(this.memoryStore.profiles.values()).find(p => p.customDomain === customDomain);
    }
    try {
      const result = await this.db.select().from(profiles).where(eq(profiles.customDomain, customDomain)).limit(1);
      return result[0];
    } catch (error) {
      console.error("getProfileByCustomDomain error:", error);
      return undefined;
    }
  }

  async getDefaultProfile(): Promise<Profile | undefined> {
    if (this.memoryStore) {
      return Array.from(this.memoryStore.profiles.values())[0];
    }
    try {
      const result = await this.db.select().from(profiles).limit(1);
      return result[0];
    } catch (error) {
      console.error("getDefaultProfile error:", error);
      return undefined;
    }
  }

  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    if (this.memoryStore) {
      const newProfile: Profile = {
        id: `profile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...insertProfile,
        bio: insertProfile.bio || "",
        avatar: insertProfile.avatar || "",
        theme: insertProfile.theme || "neon",
        primaryColor: insertProfile.primaryColor || "#8B5CF6",
        backgroundColor: insertProfile.backgroundColor || "#0A0A0F",
        views: 0,
        backgroundImage: null,
        backgroundVideo: null,
        backgroundType: insertProfile.backgroundType || "color",
        customCSS: null,
        layout: insertProfile.layout || "stacked",
        fontFamily: insertProfile.fontFamily || "DM Sans",
        buttonStyle: insertProfile.buttonStyle || "rounded",
        templateHTML: null,
        useCustomTemplate: insertProfile.useCustomTemplate ?? false,
        seoTitle: null,
        seoDescription: null,
        ogImage: null,
        customDomain: null,
        hideBranding: insertProfile.hideBranding ?? false,
        verificationBadge: insertProfile.verificationBadge ?? false,
      };
      this.memoryStore.profiles.set(newProfile.id, newProfile);
      this.memoryStore.profiles.set(newProfile.username, newProfile);
      return newProfile;
    }
    try {
      const result = await this.db.insert(profiles).values(insertProfile).returning();
      return result[0];
    } catch (error) {
      console.error("createProfile error:", error);
      throw new Error("Failed to create profile");
    }
  }

  async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile | undefined> {
    console.log("[Storage] updateProfile called with:", {
      id,
      seoTitle: updates.seoTitle,
      seoDescription: updates.seoDescription,
      ogImage: updates.ogImage,
    });
    
    if (this.memoryStore) {
      const current = this.memoryStore.profiles.get(id);
      if (!current) return undefined;

      const updated = { ...current, ...updates };
      this.memoryStore.profiles.set(id, updated);

      // Update username index if username changed
      if (updates.username && updates.username !== current.username) {
        this.memoryStore.profiles.delete(current.username);
        this.memoryStore.profiles.set(updates.username, updated);
      }

      return updated;
    }
    try {
      const result = await this.db.update(profiles).set(updates).where(eq(profiles.id, id)).returning();
      console.log("[Storage] Profile updated in DB:", {
        seoTitle: result[0]?.seoTitle,
        seoDescription: result[0]?.seoDescription,
        ogImage: result[0]?.ogImage,
      });
      return result[0];
    } catch (error) {
      console.error("updateProfile error:", error);
      return undefined;
    }
  }

  async getSocialLinks(profileId: string): Promise<SocialLink[]> {
    if (this.memoryStore) {
      return Array.from(this.memoryStore.socialLinks.values())
        .filter(link => link.profileId === profileId)
        .sort((a, b) => a.order - b.order);
    }
    try {
      return await this.db.select().from(socialLinks).where(eq(socialLinks.profileId, profileId)).orderBy(socialLinks.order);
    } catch (error) {
      console.error("getSocialLinks error:", error);
      return [];
    }
  }

  async getSocialLink(id: string): Promise<SocialLink | undefined> {
    if (this.memoryStore) {
      return this.memoryStore.socialLinks.get(id);
    }
    const result = await this.db.select().from(socialLinks).where(eq(socialLinks.id, id)).limit(1);
    return result[0];
  }

  async createSocialLink(insertLink: InsertSocialLink): Promise<SocialLink> {
    if (this.memoryStore) {
      const newLink: SocialLink = {
        id: `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...insertLink,
        clicks: 0,
      } as SocialLink;
      this.memoryStore.socialLinks.set(newLink.id, newLink);
      return newLink;
    }
    const result = await this.db.insert(socialLinks).values(insertLink).returning();
    return result[0];
  }

  async updateSocialLink(id: string, updates: Partial<SocialLink>): Promise<SocialLink | undefined> {
    if (this.memoryStore) {
      const current = this.memoryStore.socialLinks.get(id);
      if (!current) return undefined;
      const updated = { ...current, ...updates };
      this.memoryStore.socialLinks.set(id, updated);
      return updated;
    }
    const result = await this.db.update(socialLinks).set(updates).where(eq(socialLinks.id, id)).returning();
    return result[0];
  }

  async deleteSocialLink(id: string): Promise<boolean> {
    if (this.memoryStore) {
      return this.memoryStore.socialLinks.delete(id);
    }
    const result = await this.db.delete(socialLinks).where(eq(socialLinks.id, id)).returning();
    return result.length > 0;
  }

  async reorderSocialLinks(linksToReorder: Array<{ id: string; order: number }>): Promise<void> {
    if (this.memoryStore) {
      for (const { id, order } of linksToReorder) {
        const link = this.memoryStore.socialLinks.get(id);
        if (link) {
          link.order = order;
          this.memoryStore.socialLinks.set(id, link);
        }
      }
      return;
    }
    for (const { id, order } of linksToReorder) {
      await this.db.update(socialLinks).set({ order }).where(eq(socialLinks.id, id));
    }
  }

  async getLinkGroups(profileId: string): Promise<LinkGroup[]> {
    if (this.memoryStore) {
      return Array.from(this.memoryStore.linkGroups.values())
        .filter(group => group.profileId === profileId)
        .sort((a, b) => a.order - b.order);
    }
    try {
      return await this.db.select().from(linkGroups).where(eq(linkGroups.profileId, profileId)).orderBy(linkGroups.order);
    } catch (error) {
      console.error("getLinkGroups error:", error);
      return [];
    }
  }

  async createLinkGroup(group: InsertLinkGroup): Promise<LinkGroup> {
    if (this.memoryStore) {
      const newGroup: LinkGroup = {
        id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...group,
      } as LinkGroup;
      this.memoryStore.linkGroups.set(newGroup.id, newGroup);
      return newGroup;
    }
    const result = await this.db.insert(linkGroups).values(group).returning();
    return result[0];
  }

  async deleteLinkGroup(id: string): Promise<boolean> {
    if (this.memoryStore) {
      return this.memoryStore.linkGroups.delete(id);
    }
    const result = await this.db.delete(linkGroups).where(eq(linkGroups.id, id)).returning();
    return result.length > 0;
  }

  async getContentBlocks(profileId: string): Promise<ContentBlock[]> {
    if (this.memoryStore) {
      return Array.from(this.memoryStore.contentBlocks.values())
        .filter(block => block.profileId === profileId)
        .sort((a, b) => a.order - b.order);
    }
    try {
      return await this.db.select().from(contentBlocks).where(eq(contentBlocks.profileId, profileId)).orderBy(contentBlocks.order);
    } catch (error) {
      console.error("getContentBlocks error:", error);
      return [];
    }
  }

  async createContentBlock(block: InsertContentBlock): Promise<ContentBlock> {
    if (this.memoryStore) {
      const newBlock: ContentBlock = {
        id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...block,
      } as ContentBlock;
      this.memoryStore.contentBlocks.set(newBlock.id, newBlock);
      return newBlock;
    }
    const result = await this.db.insert(contentBlocks).values(block).returning();
    return result[0];
  }

  async updateContentBlock(id: string, updates: Partial<ContentBlock>): Promise<ContentBlock | undefined> {
    if (this.memoryStore) {
      const current = this.memoryStore.contentBlocks.get(id);
      if (!current) return undefined;
      const updated = { ...current, ...updates };
      this.memoryStore.contentBlocks.set(id, updated);
      return updated;
    }
    const result = await this.db.update(contentBlocks).set(updates).where(eq(contentBlocks.id, id)).returning();
    return result[0];
  }

  async deleteContentBlock(id: string): Promise<boolean> {
    if (this.memoryStore) {
      return this.memoryStore.contentBlocks.delete(id);
    }
    const result = await this.db.delete(contentBlocks).where(eq(contentBlocks.id, id)).returning();
    return result.length > 0;
  }

  async reorderContentBlocks(blocksToReorder: Array<{ id: string; order: number }>): Promise<void> {
    if (this.memoryStore) {
      for (const { id, order } of blocksToReorder) {
        const block = this.memoryStore.contentBlocks.get(id);
        if (block) {
          block.order = order;
          this.memoryStore.contentBlocks.set(id, block);
        }
      }
      return;
    }
    for (const { id, order } of blocksToReorder) {
      await this.db.update(contentBlocks).set({ order }).where(eq(contentBlocks.id, id));
    }
  }

  async getFormSubmissions(profileId: string): Promise<FormSubmission[]> {
    if (this.memoryStore) {
      return Array.from(this.memoryStore.formSubmissions.values())
        .filter(submission => submission.profileId === profileId);
    }
    try {
      return await this.db.select().from(formSubmissions).where(eq(formSubmissions.profileId, profileId));
    } catch (error) {
      console.error("getFormSubmissions error:", error);
      return [];
    }
  }

  async getFormSubmissionById(id: string): Promise<FormSubmission | undefined> {
    if (this.memoryStore) {
      return this.memoryStore.formSubmissions.get(id);
    }
    try {
      const result = await this.db.select().from(formSubmissions).where(eq(formSubmissions.id, id));
      return result[0];
    } catch (error) {
      console.error("getFormSubmissionById error:", error);
      return undefined;
    }
  }

  async createFormSubmission(submission: InsertFormSubmission): Promise<FormSubmission> {
    if (this.memoryStore) {
      const newSubmission: FormSubmission = {
        id: `submission-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...submission,
      } as FormSubmission;
      this.memoryStore.formSubmissions.set(newSubmission.id, newSubmission);
      return newSubmission;
    }
    const result = await this.db.insert(formSubmissions).values(submission).returning();
    return result[0];
  }

  async deleteFormSubmission(id: string): Promise<boolean> {
    if (this.memoryStore) {
      return this.memoryStore.formSubmissions.delete(id);
    }
    const result = await this.db.delete(formSubmissions).where(eq(formSubmissions.id, id)).returning();
    return result.length > 0;
  }

  async trackLinkClick(linkId: string, userAgent?: string, referrer?: string): Promise<void> {
    if (this.memoryStore) {
      // In-memory tracking for link clicks
      this.memoryStore.linkClicks.push({ linkId, timestamp: new Date().toISOString(), userAgent, referrer });
      return;
    }
    await this.db.update(socialLinks).set({
      clicks: drizzleSql`${socialLinks.clicks} + 1`
    }).where(eq(socialLinks.id, linkId));

    await this.db.insert(linkClicks).values({
      linkId,
      timestamp: new Date().toISOString(),
      userAgent,
      referrer,
    });
  }

  async trackProfileView(profileId: string, userAgent?: string, referrer?: string): Promise<void> {
    if (this.memoryStore) {
      // In-memory tracking for profile views
      this.memoryStore.profileViews.push({ profileId, timestamp: new Date().toISOString(), userAgent, referrer });
      return;
    }
    await this.db.update(profiles).set({
      views: drizzleSql`${profiles.views} + 1`
    }).where(eq(profiles.id, profileId));

    await this.db.insert(profileViews).values({
      profileId,
      timestamp: new Date().toISOString(),
      userAgent,
      referrer,
    });
  }

  async getLinkAnalytics(linkId: string): Promise<{ clicks: number }> {
    if (this.memoryStore) {
      const clicks = this.memoryStore.linkClicks.filter(click => click.linkId === linkId).length;
      return { clicks };
    }
    const link = await this.getSocialLink(linkId);
    return { clicks: link?.clicks || 0 };
  }

  async getProfileAnalytics(profileId: string): Promise<{ views: number; totalClicks: number; linkCount: number }> {
    if (this.memoryStore) {
      const views = this.memoryStore.profileViews.filter(view => view.profileId === profileId).length;
      const links = await this.getSocialLinks(profileId); // This will fetch links from memory if in-memory is used
      const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0);
      return {
        views,
        totalClicks,
        linkCount: links.length,
      };
    }
    const profile = await this.getProfile(profileId);
    const links = await this.getSocialLinks(profileId);
    const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0);

    return {
      views: profile?.views || 0,
      totalClicks,
      linkCount: links.length,
    };
  }

  async getDetailedAnalytics(profileId: string): Promise<{
    totalViews: number;
    totalClicks: number;
    linkCount: number;
    formSubmissions: number;
    topLinks: Array<{ platform: string; url: string; clicks: number }>;
    recentViews: Array<{ timestamp: string; userAgent?: string; referrer?: string }>;
  }> {
    if (this.memoryStore) {
      const views = this.memoryStore.profileViews.filter(view => view.profileId === profileId);
      const links = await this.getSocialLinks(profileId); // This will fetch links from memory if in-memory is used
      const submissions = await this.getFormSubmissions(profileId); // This will fetch submissions from memory if in-memory is used

      const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0);
      const topLinks = links
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 5)
        .map(link => ({ platform: link.platform, url: link.url, clicks: link.clicks }));

      return {
        totalViews: views.length,
        totalClicks,
        linkCount: links.length,
        formSubmissions: submissions.length,
        topLinks,
        recentViews: views.map(v => ({
          timestamp: v.timestamp,
          userAgent: v.userAgent || undefined,
          referrer: v.referrer || undefined,
        })),
      };
    }
    const profile = await this.getProfile(profileId);
    const links = await this.getSocialLinks(profileId);
    const submissions = await this.getFormSubmissions(profileId);
    const views = await this.db.select().from(profileViews)
      .where(eq(profileViews.profileId, profileId))
      .orderBy(drizzleSql`${profileViews.timestamp} DESC`)
      .limit(10);

    const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0);
    const topLinks = links
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5)
      .map(link => ({ platform: link.platform, url: link.url, clicks: link.clicks }));

    return {
      totalViews: profile?.views || 0,
      totalClicks,
      linkCount: links.length,
      formSubmissions: submissions.length,
      topLinks,
      recentViews: views.map((v: { timestamp: string; userAgent: string | null; referrer: string | null }) => ({
        timestamp: v.timestamp,
        userAgent: v.userAgent || undefined,
        referrer: v.referrer || undefined,
      })),
    };
  }

  async getStreakByUserId(userId: string): Promise<DailyStreak | undefined> {
    if (this.memoryStore) return this.memoryStore.dailyStreaks.get(userId);
    try {
      const result = await this.db.select().from(dailyStreaks).where(eq(dailyStreaks.userId, userId)).limit(1);
      return result[0];
    } catch (error) {
      console.error("getStreakByUserId error:", error);
      return undefined;
    }
  }

  async updateStreak(userId: string, data: Partial<DailyStreak>): Promise<void> {
    if (this.memoryStore) {
      const current = this.memoryStore.dailyStreaks.get(userId) || { userId, streakCount: 0, totalPointsEarned: 0, id: crypto.randomUUID() };
      this.memoryStore.dailyStreaks.set(userId, { ...current as any, ...data } as any);
      return;
    }
    try {
      // Check if record exists
      const existing = await this.db.select().from(dailyStreaks).where(eq(dailyStreaks.userId, userId)).limit(1);
      
      if (existing.length > 0) {
        // Update existing record
        await this.db.update(dailyStreaks).set({ ...data, updatedAt: new Date().toISOString() }).where(eq(dailyStreaks.userId, userId));
      } else {
        // Insert new record
        await this.db.insert(dailyStreaks).values({
          userId,
          streakCount: data.streakCount || 0,
          lastClaimedDate: data.lastClaimedDate || null,
          totalPointsEarned: data.totalPointsEarned || 0,
        });
      }
    } catch (error) {
      console.error("updateStreak error:", error);
    }
  }

  async getPointsByUserId(userId: string): Promise<UserPoints | undefined> {
    if (this.memoryStore) return this.memoryStore.userPoints.get(userId);
    try {
      const result = await this.db.select().from(userPoints).where(eq(userPoints.userId, userId)).limit(1);
      return result[0];
    } catch (error) {
      console.error("getPointsByUserId error:", error);
      return undefined;
    }
  }

  async addPoints(userId: string, points: number): Promise<void> {
    let current = await this.getPointsByUserId(userId);
    
    if (!current) {
      // Initialize new points record
      if (this.memoryStore) {
        current = { 
          id: crypto.randomUUID(), 
          userId, 
          totalPoints: points,
          earnedPoints: points,
          spentPoints: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as any;
        this.memoryStore.userPoints.set(userId, current);
        return;
      }
      // For database, try to insert new record
      try {
        await this.db.insert(userPoints).values({ 
          userId, 
          totalPoints: points,
          earnedPoints: points,
          spentPoints: 0 
        });
        return;
      } catch (error) {
        console.error("Failed to create new points record:", error);
        return;
      }
    }

    const updated = { 
      ...current, 
      totalPoints: current.totalPoints + points, 
      earnedPoints: current.earnedPoints + points,
      updatedAt: new Date().toISOString()
    };
    
    if (this.memoryStore) {
      this.memoryStore.userPoints.set(userId, updated as any);
      return;
    }
    
    try {
      await this.db.update(userPoints).set(updated).where(eq(userPoints.userId, userId));
    } catch (error) {
      console.error("addPoints error:", error);
    }
  }

  async deductPoints(userId: string, points: number): Promise<void> {
    let current = await this.getPointsByUserId(userId);
    
    if (!current) {
      console.warn("deductPoints called for user with no points record:", userId);
      return;
    }

    const updated = { 
      ...current, 
      totalPoints: Math.max(0, current.totalPoints - points), 
      spentPoints: current.spentPoints + points,
      updatedAt: new Date().toISOString()
    };
    
    if (this.memoryStore) {
      this.memoryStore.userPoints.set(userId, updated as any);
      return;
    }
    
    try {
      await this.db.update(userPoints).set(updated).where(eq(userPoints.userId, userId));
    } catch (error) {
      console.error("deductPoints error:", error);
    }
  }

  async getShopItems(): Promise<ShopItem[]> {
    if (this.memoryStore) return Array.from(this.memoryStore.shopItems.values());
    try {
      return await this.db.select().from(shopItems).where(eq(shopItems.isActive, true));
    } catch (error) {
      console.error("getShopItems error:", error);
      return [];
    }
  }

  async getShopItem(id: string): Promise<ShopItem | undefined> {
    if (this.memoryStore) return this.memoryStore.shopItems.get(id);
    try {
      const result = await this.db.select().from(shopItems).where(eq(shopItems.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error("getShopItem error:", error);
      return undefined;
    }
  }

  async getPurchasesByUserId(userId: string): Promise<UserPurchase[]> {
    if (this.memoryStore) return this.memoryStore.userPurchases.filter(p => p.userId === userId);
    try {
      return await this.db.select().from(userPurchases).where(eq(userPurchases.userId, userId));
    } catch (error) {
      console.error("getPurchasesByUserId error:", error);
      return [];
    }
  }

  async createPurchase(userId: string, itemId: string): Promise<void> {
    if (this.memoryStore) {
      this.memoryStore.userPurchases.push({ id: crypto.randomUUID(), userId, itemId, purchaseDate: new Date().toISOString() });
      return;
    }
    try {
      await this.db.insert(userPurchases).values({ userId, itemId });
    } catch (error) {
      console.error("createPurchase error:", error);
    }
  }
}

export const storage = new DatabaseStorage();