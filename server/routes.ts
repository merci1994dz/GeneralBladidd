import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChannelSchema, updateChannelSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all channels
  app.get("/api/channels", async (req, res) => {
    try {
      const channels = await storage.getAllChannels();
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

  // Create new channel
  app.post("/api/channels", async (req, res) => {
    try {
      const validatedData = insertChannelSchema.parse(req.body);
      const channel = await storage.createChannel(validatedData);
      res.status(201).json(channel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid channel data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create channel" });
    }
  });

  // Update channel
  app.put("/api/channels/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateChannelSchema.parse(req.body);
      const channel = await storage.updateChannel(id, validatedData);
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

  // Delete channel
  app.delete("/api/channels/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteChannel(id);
      if (!deleted) {
        return res.status(404).json({ message: "Channel not found" });
      }
      res.json({ message: "Channel deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete channel" });
    }
  });

  // Get app statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const channels = await storage.getAllChannels();
      const stats = {
        totalChannels: channels.length,
        activeUsers: 1432, // Mock data for demo
        todayViews: 856,
        uptime: "98%"
      };
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
