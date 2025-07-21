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
        name: "beIN Sports 1 HD",
        url: "https://d2e1asnsl7br7b.cloudfront.net/bein1.m3u8",
        category: "sports",
        description: "قناة رياضية عالمية • بجودة عالية HD",
        logo: null,
        isActive: true
      },
      {
        name: "beIN Sports 2 HD",
        url: "https://d2e1asnsl7br7b.cloudfront.net/bein2.m3u8",
        category: "sports",
        description: "قناة رياضية عالمية • بجودة عالية HD",
        logo: null,
        isActive: true
      },
      {
        name: "beIN Sports Premium",
        url: "https://d2e1asnsl7br7b.cloudfront.net/beinpremium.m3u8",
        category: "sports",
        description: "بث حصري للمباريات المهمة • 4K",
        logo: null,
        isActive: true
      },
      {
        name: "الجزيرة الرياضية",
        url: "https://live-hls-web-ajsp.getaj.net/AJA-YT/playlist.m3u8",
        category: "sports",
        description: "قناة الجزيرة الرياضية • مباراة مباشرة",
        logo: null,
        isActive: true
      },
      {
        name: "النهار TV",
        url: "https://live.ennaharonline.com/live/ennahar.m3u8",
        category: "algerian",
        description: "القناة الجزائرية الأولى • أخبار ومنوعات",
        logo: null,
        isActive: true
      },
      {
        name: "الشروق TV",
        url: "https://live.echorouktv.com/live/echorouk.m3u8",
        category: "algerian",
        description: "قناة الشروق الجزائرية • برامج متنوعة",
        logo: null,
        isActive: true
      },
      {
        name: "الجزائرية الأولى",
        url: "https://live.entv.dz/live/entv1.m3u8",
        category: "algerian",
        description: "القناة الوطنية الجزائرية الأولى",
        logo: null,
        isActive: true
      },
      {
        name: "قناة الجزيرة",
        url: "https://live-hls-web-aje.getaj.net/AJE/playlist.m3u8",
        category: "news",
        description: "أخبار عالمية باللغة العربية • مباشر 24/7",
        logo: null,
        isActive: true
      },
      {
        name: "العربية",
        url: "https://live.alarabiya.net/live/alarabiya.m3u8",
        category: "news",
        description: "أخبار الشرق الأوسط والعالم • تحديثات فورية",
        logo: null,
        isActive: true
      },
      {
        name: "سكاي نيوز عربية",
        url: "https://stream.skynewsarabia.com/live/skynews.m3u8",
        category: "news",
        description: "أخبار عاجلة ومتابعة شاملة للأحداث",
        logo: null,
        isActive: true
      },
      {
        name: "كرتون نتورك عربية",
        url: "https://stream.cartoonnetworkarabic.com/live/cartoon.m3u8",
        category: "kids",
        description: "أفلام كرتون وبرامج أطفال مدبلجة",
        logo: null,
        isActive: true
      },
      {
        name: "MBC 3",
        url: "https://live.mbc.net/live/mbc3.m3u8",
        category: "kids",
        description: "برامج وأفلام كرتون للأطفال • MBC",
        logo: null,
        isActive: true
      },
      {
        name: "طيور الجنة",
        url: "https://live.toyor.com/live/toyor.m3u8",
        category: "kids",
        description: "أناشيد وبرامج تعليمية للأطفال",
        logo: null,
        isActive: true
      },
      {
        name: "MBC 1",
        url: "https://live.mbc.net/live/mbc1.m3u8",
        category: "entertainment",
        description: "مسلسلات وبرامج ترفيهية عربية",
        logo: null,
        isActive: true
      },
      {
        name: "MBC 4",
        url: "https://live.mbc.net/live/mbc4.m3u8",
        category: "entertainment",
        description: "أفلام ومسلسلات أجنبية مترجمة",
        logo: null,
        isActive: true
      }
    ];

    sampleChannels.forEach(channel => {
      const fullChannel: Channel = {
        ...channel,
        id: this.channelIdCounter++,
        createdAt: new Date(),
        description: channel.description || null,
        logo: channel.logo || null,
        isActive: channel.isActive ?? true
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
