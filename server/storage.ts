import { channels, users, type Channel, type InsertChannel, type UpdateChannel, type User, type InsertUser } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private channels: Map<number, Channel>;
  private users: Map<number, User>;
  private channelIdCounter: number;
  private userIdCounter: number;

  constructor() {
    this.channels = new Map();
    this.users = new Map();
    this.channelIdCounter = 1;
    this.userIdCounter = 1;
    
    // Initialize with sample channels
    this.initializeSampleChannels();
  }

  private initializeSampleChannels() {
    const sampleChannels: Omit<Channel, 'id' | 'createdAt'>[] = [
      {
        name: "beIN Sports 1",
        url: "https://example.com/bein1.m3u8",
        category: "sports",
        description: "قناة رياضية • جودة عالية",
        logo: null,
        isActive: true
      },
      {
        name: "beIN Sports 2",
        url: "https://example.com/bein2.m3u8",
        category: "sports",
        description: "قناة رياضية • جودة عالية",
        logo: null,
        isActive: true
      },
      {
        name: "Ennahar TV",
        url: "https://example.com/ennahar.m3u8",
        category: "algerian",
        description: "قناة جزائرية • عامة",
        logo: null,
        isActive: true
      },
      {
        name: "Echorouk TV",
        url: "https://example.com/echorouk.m3u8",
        category: "algerian",
        description: "قناة جزائرية • عامة",
        logo: null,
        isActive: true
      },
      {
        name: "Al Jazeera",
        url: "https://example.com/aljazeera.m3u8",
        category: "news",
        description: "قناة إخبارية • دولية",
        logo: null,
        isActive: true
      },
      {
        name: "Al Arabiya",
        url: "https://example.com/alarabiya.m3u8",
        category: "news",
        description: "قناة إخبارية • دولية",
        logo: null,
        isActive: true
      },
      {
        name: "Cartoon Network",
        url: "https://example.com/cartoon.m3u8",
        category: "kids",
        description: "قناة أطفال • كرتون",
        logo: null,
        isActive: true
      },
      {
        name: "Disney Channel",
        url: "https://example.com/disney.m3u8",
        category: "kids",
        description: "قناة أطفال • ديزني",
        logo: null,
        isActive: true
      }
    ];

    sampleChannels.forEach(channel => {
      const fullChannel: Channel = {
        ...channel,
        id: this.channelIdCounter++,
        createdAt: new Date()
      };
      this.channels.set(fullChannel.id, fullChannel);
    });
  }

  async getAllChannels(): Promise<Channel[]> {
    return Array.from(this.channels.values()).filter(channel => channel.isActive);
  }

  async getChannelById(id: number): Promise<Channel | undefined> {
    return this.channels.get(id);
  }

  async getChannelsByCategory(category: string): Promise<Channel[]> {
    return Array.from(this.channels.values()).filter(
      channel => channel.category === category && channel.isActive
    );
  }

  async createChannel(insertChannel: InsertChannel): Promise<Channel> {
    const channel: Channel = {
      ...insertChannel,
      id: this.channelIdCounter++,
      createdAt: new Date()
    };
    this.channels.set(channel.id, channel);
    return channel;
  }

  async updateChannel(id: number, updateChannel: UpdateChannel): Promise<Channel | undefined> {
    const existingChannel = this.channels.get(id);
    if (!existingChannel) return undefined;

    const updatedChannel: Channel = {
      ...existingChannel,
      ...updateChannel
    };
    this.channels.set(id, updatedChannel);
    return updatedChannel;
  }

  async deleteChannel(id: number): Promise<boolean> {
    return this.channels.delete(id);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      user => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: this.userIdCounter++
    };
    this.users.set(user.id, user);
    return user;
  }
}

export const storage = new MemStorage();
