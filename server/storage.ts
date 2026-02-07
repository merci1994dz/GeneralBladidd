import { channels, type Channel, type InsertChannel, type UpdateChannel, users, type User, type InsertUser, viewStats, type InsertViewStat, type ViewStat } from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  getAllChannels(): Promise<Channel[]>;
  getChannelById(id: number): Promise<Channel | undefined>;
  getChannelsByCategory(category: string): Promise<Channel[]>;
  createChannel(channel: InsertChannel): Promise<Channel>;
  updateChannel(id: number, channel: UpdateChannel): Promise<Channel | undefined>;
  deleteChannel(id: number): Promise<boolean>;
  deleteAllChannels(): Promise<void>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  async getAllChannels(): Promise<Channel[]> {
    const result = await db.select().from(channels);
    return result;
  }

  async getChannelById(id: number): Promise<Channel | undefined> {
    const [channel] = await db.select().from(channels).where(eq(channels.id, id));
    return channel || undefined;
  }

  async getChannelsByCategory(category: string): Promise<Channel[]> {
    const result = await db.select().from(channels)
      .where(eq(channels.category, category));
    return result;
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
    return true;
  }

  async deleteAllChannels(): Promise<void> {
    await db.delete(channels);
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

  async recordView(viewData: InsertViewStat): Promise<void> {
    await db.insert(viewStats).values(viewData);
  }

  async getViewStats(period: string): Promise<any> {
    const now = new Date();
    let startDate = new Date();
    
    switch(period) {
      case '24h':
        startDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }
    
    const views = await db.select().from(viewStats)
      .where(sql`${viewStats.timestamp} >= ${startDate.getTime()}`);
    
    return {
      totalViews: views.length,
      uniqueIPs: new Set(views.map(v => v.ipAddress)).size,
      totalDuration: views.reduce((sum, v) => sum + (v.duration || 0), 0),
      period
    };
  }

  async getTopChannels(limit: number): Promise<any[]> {
    const result = await db.select({
      channelId: viewStats.channelId,
      views: sql<number>`count(*)`,
      totalDuration: sql<number>`sum(${viewStats.duration})`
    })
    .from(viewStats)
    .groupBy(viewStats.channelId)
    .orderBy(sql`count(*) desc`)
    .limit(limit);
    
    const channelsData = await Promise.all(
      result.map(async (r) => {
        const channel = await this.getChannelById(r.channelId);
        return {
          ...channel,
          views: r.views,
          totalDuration: r.totalDuration
        };
      })
    );
    
    return channelsData;
  }
}

export const storage = new DatabaseStorage();
