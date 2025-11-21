import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertProfileSchema, updateProfileSchema, insertSocialLinkSchema,
  insertLinkGroupSchema, insertContentBlockSchema, insertFormSubmissionSchema
} from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import { promises as fs } from "fs";
import crypto from "crypto";
import session from "express-session";
import bcrypt from "bcrypt";

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    username?: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'neropage-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    name: 'connect.sid',
    proxy: true,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
      path: '/'
    },
    rolling: true
  }));

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      console.log('Login attempt for username:', username);
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      // Get user by username
      const user = await storage.getUserByUsername(username);
      if (!user) {
        console.log('User not found for username:', username);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Verify password
      const passwordValid = await bcrypt.compare(password, user.passwordHash);
      if (!passwordValid) {
        console.log('Invalid password for username:', username);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Get profile
      const profile = await storage.getProfileByUsername(username);
      if (!profile) {
        console.log('Profile not found for username:', username);
        return res.status(500).json({ error: "Profile not found" });
      }

      console.log('Login successful for:', profile.username);

      // Set session
      req.session.userId = user.id;
      req.session.username = user.username;

      // Explicitly save session before responding
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ error: "Failed to save session" });
        }
        
        console.log('Session saved successfully. SessionID:', req.sessionID);
        res.json({ 
          user: { id: user.id, username: user.username },
          profile 
        });
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

      // Check if username already exists
      const existing = await storage.getProfileByUsername(username);
      if (existing) {
        return res.status(409).json({ error: "Username already taken" });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user and profile
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
      });

      // Set session for newly created user
      req.session.userId = user.id;
      req.session.username = user.username;

      // Explicitly save session before responding
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ error: "Failed to save session" });
        }
        
        console.log('Session saved successfully for new user:', req.sessionID);
        res.status(201).json({ 
          user: { id: user.id, username: user.username },
          profile 
        });
      });
    } catch (error) {
      res.status(500).json({ error: "Signup failed" });
    }
  });

  // Get authenticated user
  app.get("/api/auth/me", async (req, res) => {
    try {
      console.log('Session check - sessionID:', req.sessionID, 'userId:', req.session.userId, 'username:', req.session.username);
      console.log('Cookies:', req.headers.cookie);
      
      // Check if user is logged in via session
      if (req.session.userId && req.session.username) {
        const profile = await storage.getProfileByUsername(req.session.username);
        if (profile) {
          console.log('Found profile for user:', profile.username);
          return res.json({ 
            user: { id: profile.userId, username: profile.username },
            profile 
          });
        } else {
          console.log('Profile not found for username:', req.session.username);
        }
      } else {
        console.log('No session data found - sessionID:', req.sessionID);
      }

      // No session - return 401
      return res.status(401).json({ error: "Not authenticated" });
    } catch (error) {
      console.error('Error in /api/auth/me:', error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", async (req, res) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: "Logout failed" });
        }
        res.clearCookie('connect.sid');
        res.json({ success: true, message: "Logged out successfully" });
      });
    } catch (error) {
      res.status(500).json({ error: "Logout failed" });
    }
  });

  // Configure multer for image uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (_req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
      }
    }
  });

  // Image upload endpoint (with authentication before multer processes)
  app.post("/api/upload-image", async (req, res, next) => {
    try {
      // Check authentication before allowing file upload
      if (!req.session.username) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const profile = await storage.getProfileByUsername(req.session.username);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      
      // Authentication successful, proceed with file upload
      next();
    } catch (error) {
      console.error("Upload authentication error:", error);
      return res.status(500).json({ error: "Authentication failed" });
    }
  }, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'data', 'uploads');
      await fs.mkdir(uploadsDir, { recursive: true });

      // Generate unique filename
      const fileExtension = path.extname(req.file.originalname);
      const fileName = `${crypto.randomBytes(16).toString('hex')}${fileExtension}`;
      const filePath = path.join(uploadsDir, fileName);

      // Save file
      await fs.writeFile(filePath, req.file.buffer);

      // Return URL
      const imageUrl = `/uploads/${fileName}`;
      res.json({ url: imageUrl, success: true });
    } catch (error) {
      console.error("Image upload error:", error);
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
      if (!req.session.username) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      let profile = await storage.getProfileByUsername(req.session.username);
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
      if (!_req.session.username) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const profile = await storage.getProfileByUsername(_req.session.username);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      // Validate partial profile data
      const updates = updateProfileSchema.parse(_req.body);

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

      // Update session username if username was changed
      if (updates.username) {
        _req.session.username = updates.username;
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
      if (!req.session.username) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const profile = await storage.getProfileByUsername(req.session.username);
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
      if (!req.session.username) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const profile = await storage.getProfileByUsername(req.session.username);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      // Convert boolean fields to numbers for Drizzle integer mode boolean columns
      const linkData = { 
        ...req.body, 
        profileId: profile.id,
      };
      
      // Only convert if the value is a boolean type
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

  // Delete a social link
  app.delete("/api/links/:id", async (req, res) => {
    try {
      if (!req.session.username) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      const profile = await storage.getProfileByUsername(req.session.username);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      // Verify link belongs to profile
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
      if (!req.session.username) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const profile = await storage.getProfileByUsername(req.session.username);
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

  // Analytics endpoint
  app.get("/api/analytics", async (_req, res) => {
    try {
      if (!_req.session.username) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const profile = await storage.getProfileByUsername(_req.session.username);
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
      if (!_req.session.username) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const profile = await storage.getProfileByUsername(_req.session.username);
      if (!profile) {
        return res.status(404).send("Profile not found");
      }

      const analytics = await storage.getDetailedAnalytics(profile.id);
      res.json(analytics);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });


  // Update specific profile (by ID) - deprecated, use /api/profiles/me instead
  app.patch("/api/profiles/:id", async (req, res) => {
    try {
      if (!req.session.username) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      const profile = await storage.getProfileByUsername(req.session.username);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      // Verify user can only update their own profile
      if (profile.id !== id) {
        return res.status(403).json({ error: "Cannot update another user's profile" });
      }

      const updates = updateProfileSchema.parse(req.body);

      // Check username uniqueness if updating username
      if (updates.username && updates.username !== profile.username) {
        const existing = await storage.getProfileByUsername(updates.username);
        if (existing) {
          return res.status(409).json({ error: "Username already taken" });
        }
      }

      const updatedProfile = await storage.updateProfile(id, updates);

      if (!updatedProfile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      // Update session username if username was changed
      if (updates.username) {
        req.session.username = updates.username;
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
      if (!req.session.username) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      const profile = await storage.getProfileByUsername(req.session.username);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      // Verify link belongs to profile
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

  // ===== Link Groups Routes =====

  // Get link groups
  app.get("/api/link-groups", async (_req, res) => {
    try {
      if (!_req.session.username) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const profile = await storage.getProfileByUsername(_req.session.username);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const groups = await storage.getLinkGroups(profile.id);
      res.json(groups);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch link groups" });
    }
  });

  // Create link group
  app.post("/api/link-groups", async (req, res) => {
    try {
      if (!req.session.username) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const profile = await storage.getProfileByUsername(req.session.username);
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

  // Delete link group
  app.delete("/api/link-groups/:id", async (req, res) => {
    try {
      if (!req.session.username) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      const profile = await storage.getProfileByUsername(req.session.username);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      // Verify ownership by checking if group belongs to this profile
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

  // ===== Content Blocks Routes =====

  // Get content blocks
  app.get("/api/content-blocks", async (_req, res) => {
    try {
      if (!_req.session.username) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const profile = await storage.getProfileByUsername(_req.session.username);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const blocks = await storage.getContentBlocks(profile.id);
      res.json(blocks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content blocks" });
    }
  });

  // Get content blocks for a specific profile
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

  // Create content block
  app.post("/api/content-blocks", async (req, res) => {
    try {
      if (!req.session.username) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const profile = await storage.getProfileByUsername(req.session.username);
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

  // Update content block
  app.patch("/api/content-blocks/:id", async (req, res) => {
    try {
      if (!req.session.username) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      const profile = await storage.getProfileByUsername(req.session.username);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      // Verify ownership by checking if block belongs to this profile
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

  // Delete content block
  app.delete("/api/content-blocks/:id", async (req, res) => {
    try {
      if (!req.session.username) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      const profile = await storage.getProfileByUsername(req.session.username);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      // Verify ownership by checking if block belongs to this profile
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

  // Reorder content blocks
  app.post("/api/content-blocks/reorder", async (req, res) => {
    try {
      if (!req.session.username) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const profile = await storage.getProfileByUsername(req.session.username);
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

      // Verify all blocks belong to this profile
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

  // ===== Form Submissions Routes =====

  // Get form submissions
  app.get("/api/form-submissions", async (_req, res) => {
    try {
      if (!_req.session.username) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const profile = await storage.getProfileByUsername(_req.session.username);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const submissions = await storage.getFormSubmissions(profile.id);
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch form submissions" });
    }
  });

  // Webhook configuration
  app.post("/api/webhooks/configure", async (req, res) => {
    try {
      if (!req.session.username) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const profile = await storage.getProfileByUsername(req.session.username);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      // Store webhook URL for email service integration
      const { webhookUrl, service } = req.body;
      
      // In a real app, this would save to database
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to configure webhook" });
    }
  });

  // Create form submission (public endpoint)
  app.post("/api/profiles/:username/submit-form", async (req, res) => {
    try {
      const { username } = req.params;
      const profile = await storage.getProfileByUsername(username);

      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const submissionData = {
        ...req.body,
        profileId: profile.id,
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
      res.status(500).json({ error: "Failed to submit form" });
    }
  });

  // Delete form submission
  app.delete("/api/form-submissions/:id", async (req, res) => {
    try {
      if (!req.session.username) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      const profile = await storage.getProfileByUsername(req.session.username);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      // Verify ownership by fetching the specific submission
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