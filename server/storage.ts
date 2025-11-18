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
}

export class FileStorage implements IStorage {
  private dataDir: string;
  private profilesFile: string;
  private linksFile: string;

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
      };
      await writeFile(this.profilesFile, JSON.stringify([defaultProfile], null, 2));
    }

    if (!existsSync(this.linksFile)) {
      await writeFile(this.linksFile, JSON.stringify([], null, 2));
    }
  }

  private async readProfiles(): Promise<Profile[]> {
    const data = await readFile(this.profilesFile, "utf-8");
    return JSON.parse(data);
  }

  private async writeProfiles(profiles: Profile[]): Promise<void> {
    await writeFile(this.profilesFile, JSON.stringify(profiles, null, 2));
  }

  private async readLinks(): Promise<SocialLink[]> {
    const data = await readFile(this.linksFile, "utf-8");
    return JSON.parse(data);
  }

  private async writeLinks(links: SocialLink[]): Promise<void> {
    await writeFile(this.linksFile, JSON.stringify(links, null, 2));
  }

  async getProfile(id: string): Promise<Profile | undefined> {
    const profiles = await this.readProfiles();
    return profiles.find((p) => p.id === id);
  }

  async getProfileByUsername(username: string): Promise<Profile | undefined> {
    const profiles = await this.readProfiles();
    return profiles.find(
      (profile) => profile.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getDefaultProfile(): Promise<Profile | undefined> {
    const profiles = await this.readProfiles();
    return profiles[0];
  }

  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const profiles = await this.readProfiles();
    const id = randomUUID();
    const profile: Profile = {
      ...insertProfile,
      id,
      bio: insertProfile.bio || "",
      avatar: insertProfile.avatar || "",
    };
    profiles.push(profile);
    await this.writeProfiles(profiles);
    return profile;
  }

  async updateProfile(id: string, updates: Partial<InsertProfile>): Promise<Profile | undefined> {
    const profiles = await this.readProfiles();
    const index = profiles.findIndex((p) => p.id === id);
    if (index === -1) return undefined;

    const updatedProfile = { ...profiles[index], ...updates };
    profiles[index] = updatedProfile;
    await this.writeProfiles(profiles);
    return updatedProfile;
  }

  async getSocialLinks(profileId: string): Promise<SocialLink[]> {
    const links = await this.readLinks();
    return links
      .filter((link) => link.profileId === profileId)
      .sort((a, b) => a.order - b.order);
  }

  async getSocialLink(id: string): Promise<SocialLink | undefined> {
    const links = await this.readLinks();
    return links.find((l) => l.id === id);
  }

  async createSocialLink(insertLink: InsertSocialLink): Promise<SocialLink> {
    const links = await this.readLinks();
    const id = randomUUID();
    const link: SocialLink = { ...insertLink, id };
    links.push(link);
    await this.writeLinks(links);
    return link;
  }

  async deleteSocialLink(id: string): Promise<boolean> {
    const links = await this.readLinks();
    const filtered = links.filter((l) => l.id !== id);
    if (filtered.length === links.length) return false;
    await this.writeLinks(filtered);
    return true;
  }

  async reorderSocialLinks(linksToReorder: Array<{ id: string; order: number }>): Promise<void> {
    const links = await this.readLinks();
    for (const { id, order } of linksToReorder) {
      const link = links.find((l) => l.id === id);
      if (link) {
        link.order = order;
      }
    }
    await this.writeLinks(links);
  }
}

export const storage = new FileStorage();
