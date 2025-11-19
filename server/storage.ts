import { 
  type Profile, type InsertProfile, 
  type SocialLink, type InsertSocialLink,
  type LinkGroup, type InsertLinkGroup,
  type ContentBlock, type InsertContentBlock,
  type FormSubmission, type InsertFormSubmission,
  profiles, socialLinks, linkGroups, contentBlocks, formSubmissions, linkClicks, profileViews
} from "@shared/schema";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, sql as drizzleSql } from "drizzle-orm";

export interface IStorage {
  // Profile methods
  getProfile(id: string): Promise<Profile | undefined>;
  getProfileByUsername(username: string): Promise<Profile | undefined>;
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
    profiles: Map<string, Profile>;
    socialLinks: Map<string, SocialLink>;
    linkGroups: Map<string, LinkGroup>;
    contentBlocks: Map<string, ContentBlock>;
    formSubmissions: Map<string, FormSubmission>;
    linkClicks: any[];
    profileViews: any[];
  } | null = null;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      console.log("✓ Using in-memory storage (no database required)");
      // Initialize in-memory storage
      this.memoryStore = {
        profiles: new Map(),
        socialLinks: new Map(),
        linkGroups: new Map(),
        contentBlocks: new Map(),
        formSubmissions: new Map(),
        linkClicks: [],
        profileViews: []
      };
      
      // Create default demo profile
      const demoProfile: Profile = {
        id: "demo-id",
        username: "demo",
        bio: "Welcome to my link hub! Find all my social profiles here.",
        avatar: "",
        theme: "neon",
        primaryColor: "#8B5CF6",
        backgroundColor: "#0A0A0F",
        views: 0,
        backgroundImage: null,
        backgroundVideo: null,
        backgroundType: "color",
        customCSS: null,
        layout: "stacked",
        fontFamily: "DM Sans",
        buttonStyle: "rounded",
        seoTitle: null,
        seoDescription: null,
        ogImage: null,
        customDomain: null,
        hideBranding: 0,
        verificationBadge: 0,
      };
      this.memoryStore.profiles.set(demoProfile.id, demoProfile);
      this.memoryStore.profiles.set(demoProfile.username, demoProfile);
      
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
      const existingProfiles = await this.db.select().from(profiles).limit(1);
      if (existingProfiles.length === 0) {
        await this.db.insert(profiles).values({
          username: "demo",
          bio: "Welcome to my link hub! Find all my social profiles here.",
          avatar: "",
          theme: "neon",
          primaryColor: "#8B5CF6",
          backgroundColor: "#0A0A0F",
        });
      }
    } catch (error) {
      console.error("Failed to initialize database:", error);
      // Continue anyway - methods will handle errors individually
    }
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
    try {
      const result = await this.db.insert(profiles).values(insertProfile).returning();
      return result[0];
    } catch (error) {
      console.error("createProfile error:", error);
      throw new Error("Failed to create profile - database unavailable");
    }
  }

  async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile | undefined> {
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
    return await this.db.select().from(linkGroups).where(eq(linkGroups.profileId, profileId)).orderBy(linkGroups.order);
  }

  async createLinkGroup(group: InsertLinkGroup): Promise<LinkGroup> {
    const result = await this.db.insert(linkGroups).values(group).returning();
    return result[0];
  }

  async deleteLinkGroup(id: string): Promise<boolean> {
    const result = await this.db.delete(linkGroups).where(eq(linkGroups.id, id)).returning();
    return result.length > 0;
  }

  async getContentBlocks(profileId: string): Promise<ContentBlock[]> {
    return await this.db.select().from(contentBlocks).where(eq(contentBlocks.profileId, profileId)).orderBy(contentBlocks.order);
  }

  async createContentBlock(block: InsertContentBlock): Promise<ContentBlock> {
    const result = await this.db.insert(contentBlocks).values(block).returning();
    return result[0];
  }

  async updateContentBlock(id: string, updates: Partial<ContentBlock>): Promise<ContentBlock | undefined> {
    const result = await this.db.update(contentBlocks).set(updates).where(eq(contentBlocks.id, id)).returning();
    return result[0];
  }

  async deleteContentBlock(id: string): Promise<boolean> {
    const result = await this.db.delete(contentBlocks).where(eq(contentBlocks.id, id)).returning();
    return result.length > 0;
  }

  async reorderContentBlocks(blocksToReorder: Array<{ id: string; order: number }>): Promise<void> {
    for (const { id, order } of blocksToReorder) {
      await this.db.update(contentBlocks).set({ order }).where(eq(contentBlocks.id, id));
    }
  }

  async getFormSubmissions(profileId: string): Promise<FormSubmission[]> {
    return await this.db.select().from(formSubmissions).where(eq(formSubmissions.profileId, profileId));
  }

  async createFormSubmission(submission: InsertFormSubmission): Promise<FormSubmission> {
    const result = await this.db.insert(formSubmissions).values(submission).returning();
    return result[0];
  }

  async deleteFormSubmission(id: string): Promise<boolean> {
    const result = await this.db.delete(formSubmissions).where(eq(formSubmissions.id, id)).returning();
    return result.length > 0;
  }

  async trackLinkClick(linkId: string, userAgent?: string, referrer?: string): Promise<void> {
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
    const link = await this.getSocialLink(linkId);
    return { clicks: link?.clicks || 0 };
  }

  async getProfileAnalytics(profileId: string): Promise<{ views: number; totalClicks: number; linkCount: number }> {
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
      recentViews: views.map(v => ({
        timestamp: v.timestamp,
        userAgent: v.userAgent || undefined,
        referrer: v.referrer || undefined,
      })),
    };
  }
}

export const storage = new DatabaseStorage();