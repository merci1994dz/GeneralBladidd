import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChannelSchema, updateChannelSchema } from "@shared/schema";
import { requireAuth } from "./auth";
import { cache } from "./cache";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all channels with optional search and pagination
  app.get("/api/channels", async (req, res) => {
    try {
      const { search, page, limit } = req.query;
      const cacheKey = `channels:all:${search || ''}:${page || ''}:${limit || ''}`;
      
      // Try cache first
      const cached = cache.get(cacheKey);
      if (cached) {
        return res.json(cached);
      }
      
      let channels = await storage.getAllChannels();
      
      // Search filter
      if (search && typeof search === 'string') {
        const searchLower = search.toLowerCase();
        channels = channels.filter(ch => 
          ch.name.toLowerCase().includes(searchLower) ||
          (ch.description && ch.description.toLowerCase().includes(searchLower))
        );
      }
      
      // Pagination
      if (page && limit) {
        const p = parseInt(page as string);
        const l = parseInt(limit as string);
        const start = (p - 1) * l;
        const total = channels.length;
        channels = channels.slice(start, start + l);
        const result = { channels, total, page: p, limit: l, totalPages: Math.ceil(total / l) };
        cache.set(cacheKey, result);
        res.json(result);
        return;
      }
      
      cache.set(cacheKey, channels);
      res.json(channels);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch channels" });
    }
  });

  // Get channels by category
  app.get("/api/channels/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const channels = await storage.getChannelsByCategory(category);
      res.json(channels);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch channels by category" });
    }
  });

  // Get channel by ID
  app.get("/api/channels/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const channel = await storage.getChannelById(id);
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }
      res.json(channel);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch channel" });
    }
  });

  // Create new channel (protected)
  app.post("/api/channels", requireAuth, async (req, res) => {
    try {
      const validatedData = insertChannelSchema.parse(req.body);
      const channel = await storage.createChannel(validatedData);
      cache.invalidatePattern('channels:');
      cache.invalidatePattern('stats:');
      res.status(201).json(channel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid channel data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create channel" });
    }
  });

  // Bulk create channels (protected)
  app.post("/api/channels/bulk", requireAuth, async (req, res) => {
    try {
      const { channels: channelData } = req.body;
      if (!Array.isArray(channelData)) {
        return res.status(400).json({ message: "Expected array of channels" });
      }
      
      let created = 0;
      let errors = 0;
      
      for (const ch of channelData) {
        try {
          const validatedData = insertChannelSchema.parse(ch);
          await storage.createChannel(validatedData);
          created++;
        } catch {
          errors++;
        }
      }
      
      res.status(201).json({ message: `Created ${created} channels, ${errors} errors`, created, errors });
    } catch (error) {
      res.status(500).json({ message: "Failed to bulk create channels" });
    }
  });

  // Update channel (protected)
  app.put("/api/channels/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateChannelSchema.parse(req.body);
      const channel = await storage.updateChannel(id, validatedData);
      cache.invalidatePattern('channels:');
      cache.invalidatePattern('stats:');
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }
      res.json(channel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid channel data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update channel" });
    }
  });

  // Delete channel (protected)
  app.delete("/api/channels/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteChannel(id);
      cache.invalidatePattern('channels:');
      cache.invalidatePattern('stats:');
      if (!deleted) {
        return res.status(404).json({ message: "Channel not found" });
      }
      res.json({ message: "Channel deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete channel" });
    }
  });

  // Delete all channels (protected)
  app.delete("/api/channels", requireAuth, async (req, res) => {
    try {
      await storage.deleteAllChannels();
      cache.clear();
      res.json({ message: "All channels deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete all channels" });
    }
  });

  // Toggle channel active status (protected)
  app.patch("/api/channels/:id/toggle", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const channel = await storage.getChannelById(id);
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }
      const updated = await storage.updateChannel(id, { isActive: !channel.isActive });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to toggle channel" });
    }
  });

  // Toggle channel featured status (protected)
  app.patch("/api/channels/:id/feature", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const channel = await storage.getChannelById(id);
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }
      const updated = await storage.updateChannel(id, { isFeatured: !channel.isFeatured });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to toggle featured" });
    }
  });

  // Get app statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const allChannels = await storage.getAllChannels();
      const categories: Record<string, number> = {};
      let activeCount = 0;
      let featuredCount = 0;
      
      for (const ch of allChannels) {
        if (ch.isActive) activeCount++;
        if (ch.isFeatured) featuredCount++;
        categories[ch.category] = (categories[ch.category] || 0) + 1;
      }
      
      const stats = {
        totalChannels: allChannels.length,
        activeChannels: activeCount,
        featuredChannels: featuredCount,
        categories,
        categoryCount: Object.keys(categories).length
      };
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Record view stat
  app.post("/api/stats/view", async (req, res) => {
    try {
      const { channelId, duration } = req.body;
      const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';
      
      await storage.recordView({
        channelId,
        ipAddress,
        userAgent,
        duration: duration || 0
      });
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to record view" });
    }
  });

  // Get view statistics (protected)
  app.get("/api/stats/views", requireAuth, async (req, res) => {
    try {
      const { period = '7d' } = req.query;
      const stats = await storage.getViewStats(period as string);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch view stats" });
    }
  });

  // Get top channels by views (protected)
  app.get("/api/stats/top-channels", requireAuth, async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      const topChannels = await storage.getTopChannels(parseInt(limit as string));
      res.json(topChannels);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch top channels" });
    }
  });

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const base64Credentials = authHeader.split(' ')[1];
      const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
      const [username] = credentials.split(':');

      const user = await storage.getUserByUsername(username);
      
      if (user && user.role === 'admin') {
        return res.json({ 
          success: true, 
          user: { 
            id: user.id, 
            username: user.username, 
            role: user.role 
          } 
        });
      }
      
      return res.status(401).json({ error: "Invalid credentials" });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
