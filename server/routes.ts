import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProfileSchema, updateProfileSchema, insertSocialLinkSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get the default profile (for MVP, we use a single profile)
  app.get("/api/profiles/me", async (_req, res) => {
    try {
      const profile = await storage.getDefaultProfile();
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  // Get profile by username
  app.get("/api/profiles/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const profile = await storage.getProfileByUsername(username);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  // Update profile
  app.patch("/api/profiles/me", async (req, res) => {
    try {
      const profile = await storage.getDefaultProfile();
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      // Validate partial profile data
      const updates = updateProfileSchema.parse(req.body);
      
      // Check username uniqueness if updating username
      if (updates.username && updates.username !== profile.username) {
        const existing = await storage.getProfileByUsername(updates.username);
        if (existing) {
          return res.status(409).json({ error: "Username already taken" });
        }
      }

      const updatedProfile = await storage.updateProfile(profile.id, updates);
      
      if (!updatedProfile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      res.json(updatedProfile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid profile data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Get social links for a profile
  app.get("/api/links", async (_req, res) => {
    try {
      const profile = await storage.getDefaultProfile();
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const links = await storage.getSocialLinks(profile.id);
      res.json(links);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch links" });
    }
  });

  // Get social links for a specific username
  app.get("/api/profiles/:username/links", async (req, res) => {
    try {
      const { username } = req.params;
      const profile = await storage.getProfileByUsername(username);
      
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const links = await storage.getSocialLinks(profile.id);
      res.json(links);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch links" });
    }
  });

  // Create a new social link
  app.post("/api/links", async (req, res) => {
    try {
      const profile = await storage.getDefaultProfile();
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      // Ensure profileId is set
      const linkData = { ...req.body, profileId: profile.id };
      const validatedData = insertSocialLinkSchema.parse(linkData);
      const link = await storage.createSocialLink(validatedData);
      res.status(201).json(link);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid link data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create link" });
    }
  });

  // Delete a social link
  app.delete("/api/links/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteSocialLink(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Link not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete link" });
    }
  });

  // Reorder social links
  app.post("/api/links/reorder", async (req, res) => {
    try {
      const profile = await storage.getDefaultProfile();
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const reorderSchema = z.object({
        links: z.array(z.object({
          id: z.string(),
          order: z.number(),
        })),
      });

      const { links } = reorderSchema.parse(req.body);
      
      // Verify all links belong to this profile
      const profileLinks = await storage.getSocialLinks(profile.id);
      const profileLinkIds = new Set(profileLinks.map(l => l.id));
      
      for (const link of links) {
        if (!profileLinkIds.has(link.id)) {
          return res.status(403).json({ error: "Cannot reorder links from another profile" });
        }
      }

      await storage.reorderSocialLinks(links);
      res.status(200).json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid reorder data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to reorder links" });
    }
  });

  // Track link click
  app.post("/api/links/:id/click", async (req, res) => {
    try {
      const { id } = req.params;
      const userAgent = req.headers['user-agent'];
      const referrer = req.headers['referer'];
      
      await storage.trackLinkClick(id, userAgent, referrer);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to track click" });
    }
  });

  // Track profile view
  app.post("/api/profiles/:username/view", async (req, res) => {
    try {
      const { username } = req.params;
      const profile = await storage.getProfileByUsername(username);
      
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const userAgent = req.headers['user-agent'];
      const referrer = req.headers['referer'];
      
      await storage.trackProfileView(profile.id, userAgent, referrer);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to track view" });
    }
  });

  // Get analytics
  app.get("/api/analytics", async (_req, res) => {
    try {
      const profile = await storage.getDefaultProfile();
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const analytics = await storage.getProfileAnalytics(profile.id);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
