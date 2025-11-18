import { type Profile, type InsertProfile, type SocialLink, type InsertSocialLink } from "@shared/schema";
import { randomUUID } from "crypto";

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
}

export class MemStorage implements IStorage {
  private profiles: Map<string, Profile>;
  private socialLinks: Map<string, SocialLink>;

  constructor() {
    this.profiles = new Map();
    this.socialLinks = new Map();
    this.initializeDefaultProfile();
  }

  private initializeDefaultProfile() {
    const defaultProfile: Profile = {
      id: randomUUID(),
      username: "demo",
      bio: "Welcome to my link hub! Find all my social profiles here.",
      avatar: "",
    };
    this.profiles.set(defaultProfile.id, defaultProfile);
  }

  async getProfile(id: string): Promise<Profile | undefined> {
    return this.profiles.get(id);
  }

  async getProfileByUsername(username: string): Promise<Profile | undefined> {
    return Array.from(this.profiles.values()).find(
      (profile) => profile.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getDefaultProfile(): Promise<Profile | undefined> {
    return Array.from(this.profiles.values())[0];
  }

  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const id = randomUUID();
    const profile: Profile = { 
      ...insertProfile, 
      id,
      bio: insertProfile.bio || "",
      avatar: insertProfile.avatar || "",
    };
    this.profiles.set(id, profile);
    return profile;
  }

  async updateProfile(id: string, updates: Partial<InsertProfile>): Promise<Profile | undefined> {
    const profile = this.profiles.get(id);
    if (!profile) return undefined;

    const updatedProfile = { ...profile, ...updates };
    this.profiles.set(id, updatedProfile);
    return updatedProfile;
  }

  async getSocialLinks(profileId: string): Promise<SocialLink[]> {
    return Array.from(this.socialLinks.values())
      .filter((link) => link.profileId === profileId)
      .sort((a, b) => a.order - b.order);
  }

  async getSocialLink(id: string): Promise<SocialLink | undefined> {
    return this.socialLinks.get(id);
  }

  async createSocialLink(insertLink: InsertSocialLink): Promise<SocialLink> {
    const id = randomUUID();
    const link: SocialLink = { ...insertLink, id };
    this.socialLinks.set(id, link);
    return link;
  }

  async deleteSocialLink(id: string): Promise<boolean> {
    return this.socialLinks.delete(id);
  }

  async reorderSocialLinks(links: Array<{ id: string; order: number }>): Promise<void> {
    for (const { id, order } of links) {
      const link = this.socialLinks.get(id);
      if (link) {
        this.socialLinks.set(id, { ...link, order });
      }
    }
  }
}

export const storage = new MemStorage();
