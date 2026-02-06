import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const channels = sqliteTable("channels", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  url: text("url").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  logo: text("logo"),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
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
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Channel categories enum
export const channelCategories = [
  'sports',
  'algerian', 
  'news',
  'kids',
  'entertainment',
  'religious',
  'documentary'
] as const;

export type ChannelCategory = typeof channelCategories[number];
