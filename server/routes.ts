import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertProfileSchema, updateProfileSchema, insertSocialLinkSchema, updateSocialLinkSchema,
  insertLinkGroupSchema, insertContentBlockSchema, insertFormSubmissionSchema
} from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import { promises as fs } from "fs";
import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'neropage-jwt-secret-change-in-production';

interface JWTPayload {
  userId: string;
  username: string;
}

function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

function getAuthToken(req: any): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

function authenticate(req: any): JWTPayload | null {
  const token = getAuthToken(req);
  if (!token) return null;
  return verifyToken(token);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      console.log('Login attempt for username:', username);

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      if (typeof username !== 'string' || username.length > 30 || !/^[a-zA-Z0-9_]+$/.test(username)) {
        console.log('Invalid username format:', username);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (typeof password !== 'string' || password.length < 1) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        console.log('User not found for username:', username);
        await bcrypt.compare(password, '$2b$10$invalidhashtopreventtimingattack');
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const passwordValid = await bcrypt.compare(password, user.passwordHash);
      if (!passwordValid) {
        console.log('Invalid password for username:', username);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      let profile = await storage.getProfileByUsername(username);
      if (!profile) {
        console.log('Profile not found for username:', username, '- creating new profile');
        // Create profile if it doesn't exist (data recovery)
        profile = await storage.createProfile({
          userId: user.id,
          username,
          bio: `Welcome to my link hub!`,
          avatar: "",
          theme: "neon",
          primaryColor: "#8B5CF6",
          backgroundColor: "#0A0A0F",
          backgroundType: "color",
          layout: "stacked",
          fontFamily: "DM Sans",
          buttonStyle: "rounded",
          useCustomTemplate: 0,
          hideBranding: 0,
          verificationBadge: 0,
        });
      }

      console.log('Login successful for:', profile.username);

      const token = generateToken({ userId: user.id, username: user.username });

      res.json({
        user: { id: user.id, username: user.username },
        profile,
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Signup endpoint
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      if (typeof username !== 'string' ||
          username.length < 3 ||
          username.length > 30 ||
          !/^[a-zA-Z0-9_]+$/.test(username)) {
        return res.status(400).json({ error: "Username must be 3-30 characters and contain only letters, numbers, and underscores" });
      }

      if (typeof password !== 'string' || password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters" });
      }

      const existing = await storage.getProfileByUsername(username);
      if (existing) {
        return res.status(409).json({ error: "Username already taken" });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await storage.createUser({
        username,
        passwordHash
      });

      const profile = await storage.createProfile({
        userId: user.id,
        username,
        bio: `Welcome to my link hub!`,
        avatar: "",
        theme: "neon",
        primaryColor: "#8B5CF6",
        backgroundColor: "#0A0A0F",
        backgroundType: "color",
        layout: "stacked",
        fontFamily: "DM Sans",
        buttonStyle: "rounded",
        useCustomTemplate: 0,
        hideBranding: 0,
        verificationBadge: 0,
      });

      const token = generateToken({ userId: user.id, username: user.username });

      res.status(201).json({
        user: { id: user.id, username: user.username },
        profile,
        token
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: "Signup failed" });
    }
  });

  // Get authenticated user
  app.get("/api/auth/me", async (req, res) => {
    try {
      const auth = authenticate(req);

      if (!auth) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const profile = await storage.getProfileByUsername(auth.username);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      return res.json({
        user: { id: auth.userId, username: auth.username },
        profile
      });
    } catch (error) {
      console.error('Error in /api/auth/me:', error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", async (req, res) => {
    res.json({ success: true, message: "Logged out successfully" });
  });

  // Configure multer for image and video uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
    fileFilter: (_req, file, cb) => {
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'
      ];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WebP images and MP4, WebM, MOV, AVI videos are allowed.'));
      }
    }
  });

  // Image upload endpoint
  app.post("/api/upload-image", async (req, res, next) => {
    try {
      const auth = authenticate(req);
      if (!auth) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const profile = await storage.getProfileByUsername(auth.username);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      if (profile.userId !== auth.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      next();
    } catch (error) {
      return res.status(500).json({ error: "Authentication failed" });
    }
  }, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const uploadsDir = path.join(process.cwd(), 'data', 'uploads');
      await fs.mkdir(uploadsDir, { recursive: true });

      const fileExtension = path.extname(req.file.originalname);
      const fileName = `${crypto.randomBytes(16).toString('hex')}${fileExtension}`;
      const filePath = path.join(uploadsDir, fileName);

      await fs.writeFile(filePath, req.file.buffer);

      const imageUrl = `/uploads/${fileName}`;
      res.json({ url: imageUrl, success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to upload image" });
    }
  });

  // Serve uploaded images
  app.use('/uploads', (req, res, next) => {
    const uploadsPath = path.join(process.cwd(), 'data', 'uploads');
    res.sendFile(path.join(uploadsPath, req.path), (err) => {
      if (err) {
        res.status(404).json({ error: "Image not found" });
      }
    });
  });

  // Get the current user's profile
  app.get("/api/profiles/me", async (req, res) => {
    try {
      const auth = authenticate(req);
      if (!auth) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      let profile = await storage.getProfileByUsername(auth.username);
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
  app.patch("/api/profiles/me", async (_req, res) => {
    try {
      const auth = authenticate(_req);
      if (!auth) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const profile = await storage.getProfileByUsername(auth.username);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      // Convert boolean fields to integers BEFORE validation for database compatibility
      const requestBody: any = { ..._req.body };
      if (typeof requestBody.useCustomTemplate === 'boolean') {
        requestBody.useCustomTemplate = requestBody.useCustomTemplate ? 1 : 0;
      }
      if (typeof requestBody.hideBranding === 'boolean') {
        requestBody.hideBranding = requestBody.hideBranding ? 1 : 0;
      }
      if (typeof requestBody.verificationBadge === 'boolean') {
        requestBody.verificationBadge = requestBody.verificationBadge ? 1 : 0;
      }

      const updates = updateProfileSchema.parse(requestBody);

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

  // Get social links for current user's profile
  app.get("/api/links", async (req, res) => {
    try {
      const auth = authenticate(req);
      if (!auth) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const profile = await storage.getProfileByUsername(auth.username);
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
      const auth = authenticate(req);
      if (!auth) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const profile = await storage.getProfileByUsername(auth.username);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const linkData = {
        ...req.body,
        profileId: profile.id,
      };

      if (typeof req.body.isScheduled === 'boolean') {
        linkData.isScheduled = req.body.isScheduled ? 1 : 0;
      }
      if (typeof req.body.isPriority === 'boolean') {
        linkData.isPriority = req.body.isPriority ? 1 : 0;
      }

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

  // Update a social link
  app.patch("/api/links/:id", async (req, res) => {
    try {
      const auth = authenticate(req);
      if (!auth) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      const profile = await storage.getProfileByUsername(auth.username);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const link = await storage.getSocialLink(id);
      if (!link || link.profileId !== profile.id) {
        return res.status(404).json({ error: "Link not found" });
      }

      const validatedUpdates = updateSocialLinkSchema.parse(req.body);
      const updates: any = { ...validatedUpdates };

      if (typeof validatedUpdates.enabled === 'boolean') {
        updates.enabled = validatedUpdates.enabled ? 1 : 0;
      }
      if (typeof validatedUpdates.isScheduled === 'boolean') {
        updates.isScheduled = validatedUpdates.isScheduled ? 1 : 0;
      }
      if (typeof validatedUpdates.isPriority === 'boolean') {
        updates.isPriority = validatedUpdates.isPriority ? 1 : 0;
      }

      const updatedLink = await storage.updateSocialLink(id, updates);

      if (!updatedLink) {
        return res.status(404).json({ error: "Link not found" });
      }

      res.json(updatedLink);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid link data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update link" });
    }
  });

  // Delete a social link
  app.delete("/api/links/:id", async (req, res) => {
    try {
      const auth = authenticate(req);
      if (!auth) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      const profile = await storage.getProfileByUsername(auth.username);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const link = await storage.getSocialLink(id);
      if (!link || link.profileId !== profile.id) {
        return res.status(404).json({ error: "Link not found" });
      }

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
      const auth = authenticate(req);
      if (!auth) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const profile = await storage.getProfileByUsername(auth.username);
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

  // Analytics endpoint
  app.get("/api/analytics", async (_req, res) => {
    try {
      const auth = authenticate(_req);
      if (!auth) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const profile = await storage.getProfileByUsername(auth.username);
      if (!profile) {
        return res.status(404).send("Profile not found");
      }

      const analytics = await storage.getProfileAnalytics(profile.id);
      res.json(analytics);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  // Detailed analytics endpoint
  app.get("/api/analytics/detailed", async (_req, res) => {
    try {
      const auth = authenticate(_req);
      if (!auth) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const profile = await storage.getProfileByUsername(auth.username);
      if (!profile) {
        return res.status(404).send("Profile not found");
      }

      const analytics = await storage.getDetailedAnalytics(profile.id);
      res.json(analytics);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  // Update specific profile (by ID)
  app.patch("/api/profiles/:id", async (req, res) => {
    try {
      const auth = authenticate(req);
      if (!auth) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      const profile = await storage.getProfileByUsername(auth.username);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      if (profile.id !== id) {
        return res.status(403).json({ error: "Cannot update another user's profile" });
      }

      const updates = updateProfileSchema.parse(req.body);

      if (updates.username && updates.username !== profile.username) {
        const existing = await storage.getProfileByUsername(updates.username);
        if (existing) {
          return res.status(409).json({ error: "Username already taken" });
        }
      }

      // Convert boolean fields to integers for database compatibility
      const dbUpdates: any = { ...updates };
      if (typeof updates.useCustomTemplate === 'boolean') {
        dbUpdates.useCustomTemplate = updates.useCustomTemplate ? 1 : 0;
      }
      if (typeof updates.hideBranding === 'boolean') {
        dbUpdates.hideBranding = updates.hideBranding ? 1 : 0;
      }
      if (typeof updates.verificationBadge === 'boolean') {
        dbUpdates.verificationBadge = updates.verificationBadge ? 1 : 0;
      }

      const updatedProfile = await storage.updateProfile(id, dbUpdates);

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

  // Update a social link
  app.patch("/api/links/:id", async (req, res) => {
    try {
      const auth = authenticate(req);
      if (!auth) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      const profile = await storage.getProfileByUsername(auth.username);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const link = await storage.getSocialLink(id);
      if (!link || link.profileId !== profile.id) {
        return res.status(404).json({ error: "Link not found" });
      }

      const updatedLink = await storage.updateSocialLink(id, req.body);
      res.json(updatedLink);
    } catch (error) {
      res.status(500).json({ error: "Failed to update link" });
    }
  });

  // Link Groups Routes
  app.get("/api/link-groups", async (_req, res) => {
    try {
      const auth = authenticate(_req);
      if (!auth) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const profile = await storage.getProfileByUsername(auth.username);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const groups = await storage.getLinkGroups(profile.id);
      res.json(groups);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch link groups" });
    }
  });

  app.post("/api/link-groups", async (req, res) => {
    try {
      const auth = authenticate(req);
      if (!auth) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const profile = await storage.getProfileByUsername(auth.username);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const groupData = { ...req.body, profileId: profile.id };
      const validatedData = insertLinkGroupSchema.parse(groupData);
      const group = await storage.createLinkGroup(validatedData);
      res.status(201).json(group);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid group data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create link group" });
    }
  });

  app.delete("/api/link-groups/:id", async (req, res) => {
    try {
      const auth = authenticate(req);
      if (!auth) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      const profile = await storage.getProfileByUsername(auth.username);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const groups = await storage.getLinkGroups(profile.id);
      const ownsGroup = groups.some(g => g.id === id);
      if (!ownsGroup) {
        return res.status(404).json({ error: "Group not found" });
      }

      const deleted = await storage.deleteLinkGroup(id);

      if (!deleted) {
        return res.status(404).json({ error: "Group not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete link group" });
    }
  });

  // Content Blocks Routes
  app.get("/api/content-blocks", async (_req, res) => {
    try {
      const auth = authenticate(_req);
      if (!auth) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const profile = await storage.getProfileByUsername(auth.username);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const blocks = await storage.getContentBlocks(profile.id);
      res.json(blocks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content blocks" });
    }
  });

  app.get("/api/profiles/:username/content-blocks", async (req, res) => {
    try {
      const { username } = req.params;
      const profile = await storage.getProfileByUsername(username);

      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const blocks = await storage.getContentBlocks(profile.id);
      res.json(blocks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content blocks" });
    }
  });

  app.post("/api/content-blocks", async (req, res) => {
    try {
      const auth = authenticate(req);
      if (!auth) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const profile = await storage.getProfileByUsername(auth.username);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const blockData = { ...req.body, profileId: profile.id };
      const validatedData = insertContentBlockSchema.parse(blockData);
      const block = await storage.createContentBlock(validatedData);
      res.status(201).json(block);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid block data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create content block" });
    }
  });

  app.patch("/api/content-blocks/:id", async (req, res) => {
    try {
      const auth = authenticate(req);
      if (!auth) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      const profile = await storage.getProfileByUsername(auth.username);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const blocks = await storage.getContentBlocks(profile.id);
      const ownsBlock = blocks.some(b => b.id === id);
      if (!ownsBlock) {
        return res.status(404).json({ error: "Block not found" });
      }

      const updatedBlock = await storage.updateContentBlock(id, req.body);

      if (!updatedBlock) {
        return res.status(404).json({ error: "Block not found" });
      }

      res.json(updatedBlock);
    } catch (error) {
      res.status(500).json({ error: "Failed to update content block" });
    }
  });

  app.delete("/api/content-blocks/:id", async (req, res) => {
    try {
      const auth = authenticate(req);
      if (!auth) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      const profile = await storage.getProfileByUsername(auth.username);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const blocks = await storage.getContentBlocks(profile.id);
      const ownsBlock = blocks.some(b => b.id === id);
      if (!ownsBlock) {
        return res.status(404).json({ error: "Block not found" });
      }

      const deleted = await storage.deleteContentBlock(id);

      if (!deleted) {
        return res.status(404).json({ error: "Block not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete content block" });
    }
  });

  app.post("/api/content-blocks/reorder", async (req, res) => {
    try {
      const auth = authenticate(req);
      if (!auth) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const profile = await storage.getProfileByUsername(auth.username);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const reorderSchema = z.object({
        blocks: z.array(z.object({
          id: z.string(),
          order: z.number(),
        })),
      });

      const { blocks } = reorderSchema.parse(req.body);

      const profileBlocks = await storage.getContentBlocks(profile.id);
      const profileBlockIds = new Set(profileBlocks.map(b => b.id));

      for (const block of blocks) {
        if (!profileBlockIds.has(block.id)) {
          return res.status(403).json({ error: "Cannot reorder blocks from another profile" });
        }
      }

      await storage.reorderContentBlocks(blocks);
      res.status(200).json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid reorder data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to reorder blocks" });
    }
  });

  // Form Submissions Routes
  app.get("/api/form-submissions", async (_req, res) => {
    try {
      const auth = authenticate(_req);
      if (!auth) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const profile = await storage.getProfileByUsername(auth.username);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const submissions = await storage.getFormSubmissions(profile.id);
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch form submissions" });
    }
  });

  app.post("/api/webhooks/configure", async (req, res) => {
    try {
      const auth = authenticate(req);
      if (!auth) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const profile = await storage.getProfileByUsername(auth.username);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const { webhookUrl, service } = req.body;

      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to configure webhook" });
    }
  });

  app.post("/api/profiles/:username/form-submit", async (req, res) => {
    try {
      const { username } = req.params;
      const profile = await storage.getProfileByUsername(username);

      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const submissionData = {
        profileId: profile.id,
        email: req.body.email,
        name: req.body.name,
        message: req.body.message,
        timestamp: new Date().toISOString(),
        userAgent: req.headers['user-agent'],
      };

      const validatedData = insertFormSubmissionSchema.parse(submissionData);
      const submission = await storage.createFormSubmission(validatedData);
      res.status(201).json({ success: true, id: submission.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid submission data", details: error.errors });
      }
      console.error('Form submission error:', error);
      res.status(500).json({ error: "Failed to submit form" });
    }
  });

  app.delete("/api/form-submissions/:id", async (req, res) => {
    try {
      const auth = authenticate(req);
      if (!auth) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      const profile = await storage.getProfileByUsername(auth.username);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const submission = await storage.getFormSubmissionById(id);
      if (!submission || submission.profileId !== profile.id) {
        return res.status(404).json({ error: "Submission not found" });
      }

      const deleted = await storage.deleteFormSubmission(id);

      if (!deleted) {
        return res.status(404).json({ error: "Submission not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete submission" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}