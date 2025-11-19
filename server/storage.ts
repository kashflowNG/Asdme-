import { type Profile, type InsertProfile, type SocialLink, type InsertSocialLink } from "@shared/schema";
import { randomUUID } from "crypto";
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export interface IStorage {
  // Profile methods
  getProfile(id: string): Promise<Profile | undefined>;
  getProfileByUsername(username: string): Promise<Profile | undefined>;
  getDefaultProfile(): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(id: string, profile: Partial<InsertProfile>): Promise<Profile | undefined>;

  // Social Link methods
  getSocialLinks(profileId: string): Promise<SocialLink[]>;
  getSocialLink(id: string): Promise<SocialLink | undefined>;
  createSocialLink(link: InsertSocialLink): Promise<SocialLink>;
  deleteSocialLink(id: string): Promise<boolean>;
  reorderSocialLinks(links: Array<{ id: string; order: number }>): Promise<void>;

  // Analytics methods
  trackLinkClick(linkId: string, userAgent?: string, referrer?: string): Promise<void>;
  trackProfileView(profileId: string, userAgent?: string, referrer?: string): Promise<void>;
  getLinkAnalytics(linkId: string): Promise<{ clicks: number }>;
  getProfileAnalytics(profileId: string): Promise<{ views: number; totalClicks: number; linkCount: number }>;
}

export class FileStorage implements IStorage {
  private dataDir: string;
  private profilesFile: string;
  private linksFile: string;

  // In-memory storage for quicker access, will be synchronized with files
  private profiles: Profile[] = [];
  private socialLinks: SocialLink[] = [];

  constructor(dataDir: string = "./data") {
    this.dataDir = dataDir;
    this.profilesFile = path.join(dataDir, "profiles.json");
    this.linksFile = path.join(dataDir, "links.json");
    this.initialize();
  }

  private async initialize() {
    if (!existsSync(this.dataDir)) {
      await mkdir(this.dataDir, { recursive: true });
    }

    if (!existsSync(this.profilesFile)) {
      const defaultProfile: Profile = {
        id: randomUUID(),
        username: "demo",
        bio: "Welcome to my link hub! Find all my social profiles here.",
        avatar: "",
        views: 0, // Initialize views for analytics
      };
      this.profiles = [defaultProfile];
      await writeFile(this.profilesFile, JSON.stringify(this.profiles, null, 2));
    } else {
      const data = await readFile(this.profilesFile, "utf-8");
      this.profiles = JSON.parse(data);
    }

    if (!existsSync(this.linksFile)) {
      this.socialLinks = [];
      await writeFile(this.linksFile, JSON.stringify(this.socialLinks, null, 2));
    } else {
      const data = await readFile(this.linksFile, "utf-8");
      // Ensure clicks and order are initialized if they don't exist
      this.socialLinks = JSON.parse(data).map((link: SocialLink) => ({
        ...link,
        clicks: link.clicks || 0,
        order: link.order || 0,
      }));
    }
  }

  private async saveData() {
    await writeFile(this.profilesFile, JSON.stringify(this.profiles, null, 2));
    await writeFile(this.linksFile, JSON.stringify(this.socialLinks, null, 2));
  }

  async getProfile(id: string): Promise<Profile | undefined> {
    return this.profiles.find((p) => p.id === id);
  }

  async getProfileByUsername(username: string): Promise<Profile | undefined> {
    return this.profiles.find(
      (profile) => profile.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getDefaultProfile(): Promise<Profile | undefined> {
    return this.profiles[0];
  }

  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const id = randomUUID();
    const profile: Profile = {
      ...insertProfile,
      id,
      bio: insertProfile.bio || "",
      avatar: insertProfile.avatar || "",
      views: 0, // Initialize views for analytics
    };
    this.profiles.push(profile);
    await this.saveData();
    return profile;
  }

  async updateProfile(id: string, updates: Partial<InsertProfile>): Promise<Profile | undefined> {
    const index = this.profiles.findIndex((p) => p.id === id);
    if (index === -1) return undefined;

    const updatedProfile = { ...this.profiles[index], ...updates };
    this.profiles[index] = updatedProfile;
    await this.saveData();
    return updatedProfile;
  }

  async getSocialLinks(profileId: string): Promise<SocialLink[]> {
    return this.socialLinks
      .filter((link) => link.profileId === profileId)
      .sort((a, b) => a.order - b.order);
  }

  async getSocialLink(id: string): Promise<SocialLink | undefined> {
    return this.socialLinks.find((l) => l.id === id);
  }

  async createSocialLink(insertLink: InsertSocialLink): Promise<SocialLink> {
    const id = randomUUID();
    const link: SocialLink = {
      ...insertLink,
      id,
      clicks: 0, // Initialize clicks for analytics
      order: this.socialLinks.filter(l => l.profileId === insertLink.profileId).length, // Default order
    };
    this.socialLinks.push(link);
    await this.saveData();
    return link;
  }

  async deleteSocialLink(id: string): Promise<boolean> {
    const initialLength = this.socialLinks.length;
    this.socialLinks = this.socialLinks.filter((l) => l.id !== id);
    if (this.socialLinks.length === initialLength) return false;
    await this.saveData();
    return true;
  }

  async reorderSocialLinks(linksToReorder: Array<{ id: string; order: number }>): Promise<void> {
    for (const { id, order } of linksToReorder) {
      const link = this.socialLinks.find((l) => l.id === id);
      if (link) {
        link.order = order;
      }
    }
    await this.saveData();
  }

  async trackLinkClick(linkId: string, userAgent?: string, referrer?: string): Promise<void> {
    const link = this.socialLinks.find((l) => l.id === linkId);
    if (link) {
      link.clicks = (link.clicks || 0) + 1;
      await this.saveData();
    }
  }

  async trackProfileView(profileId: string, userAgent?: string, referrer?: string): Promise<void> {
    const profile = this.profiles.find((p) => p.id === profileId);
    if (profile) {
      profile.views = (profile.views || 0) + 1;
      await this.saveData();
    }
  }

  async getLinkAnalytics(linkId: string): Promise<{ clicks: number }> {
    const link = this.socialLinks.find((l) => l.id === linkId);
    return link ? { clicks: link.clicks || 0 } : { clicks: 0 };
  }

  async getProfileAnalytics(profileId: string): Promise<{ views: number; totalClicks: number; linkCount: number }> {
    const profile = this.profiles.find((p) => p.id === profileId);
    const links = this.socialLinks.filter((l) => l.profileId === profileId);
    const totalClicks = links.reduce((sum, link) => sum + (link.clicks || 0), 0);

    return {
      views: profile?.views || 0,
      totalClicks,
      linkCount: links.length,
    };
  }
}

export const storage = new FileStorage();