import { channels, users, type Channel, type InsertChannel, type UpdateChannel, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Channel operations
  getAllChannels(): Promise<Channel[]>;
  getChannelById(id: number): Promise<Channel | undefined>;
  getChannelsByCategory(category: string): Promise<Channel[]>;
  createChannel(channel: InsertChannel): Promise<Channel>;
  updateChannel(id: number, channel: UpdateChannel): Promise<Channel | undefined>;
  deleteChannel(id: number): Promise<boolean>;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

// Legacy MemStorage class - kept for reference but not used

// Database storage implementation
export class DatabaseStorage implements IStorage {
  async getAllChannels(): Promise<Channel[]> {
    const result = await db.select().from(channels).where(eq(channels.isActive, true));
    return result;
  }

  async getChannelById(id: number): Promise<Channel | undefined> {
    const [channel] = await db.select().from(channels).where(eq(channels.id, id));
    return channel || undefined;
  }

  async getChannelsByCategory(category: string): Promise<Channel[]> {
    const result = await db.select().from(channels)
      .where(eq(channels.category, category));
    return result.filter(channel => channel.isActive);
  }

  async createChannel(insertChannel: InsertChannel): Promise<Channel> {
    const [channel] = await db
      .insert(channels)
      .values(insertChannel)
      .returning();
    return channel;
  }

  async updateChannel(id: number, updateChannel: UpdateChannel): Promise<Channel | undefined> {
    const [channel] = await db
      .update(channels)
      .set(updateChannel)
      .where(eq(channels.id, id))
      .returning();
    return channel || undefined;
  }

  async deleteChannel(id: number): Promise<boolean> {
    const result = await db.delete(channels).where(eq(channels.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
}

export const storage = new DatabaseStorage();
