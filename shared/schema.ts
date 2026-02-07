import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const channels = sqliteTable("channels", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  url: text("url").notNull(),
  category: text("category").notNull(),
  country: text("country").default("other"),
  description: text("description"),
  logo: text("logo"),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  isFeatured: integer("is_featured", { mode: 'boolean' }).default(false),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(new Date()),
});

export const insertChannelSchema = createInsertSchema(channels).omit({
  id: true,
  createdAt: true,
});

export const updateChannelSchema = insertChannelSchema.partial();

export type Channel = typeof channels.$inferSelect;
export type InsertChannel = z.infer<typeof insertChannelSchema>;
export type UpdateChannel = z.infer<typeof updateChannelSchema>;

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("admin"), // admin, viewer
  createdAt: integer("created_at", { mode: 'timestamp' }).default(new Date()),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const viewStats = sqliteTable("view_stats", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  channelId: integer("channel_id").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  duration: integer("duration").default(0), // seconds
  timestamp: integer("timestamp", { mode: 'timestamp' }).default(new Date()),
});

export const insertViewStatSchema = createInsertSchema(viewStats).omit({
  id: true,
  timestamp: true,
});

export type ViewStat = typeof viewStats.$inferSelect;
export type InsertViewStat = z.infer<typeof insertViewStatSchema>;

// Channel categories
export const channelCategories = [
  'sports',
  'algerian',
  'moroccan',
  'tunisian',
  'news',
  'kids',
  'entertainment',
  'religious',
  'documentary',
  'music',
  'french',
  'turkish',
  'other'
] as const;

export type ChannelCategory = typeof channelCategories[number];
