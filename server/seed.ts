import { db } from "./db";
import { channels } from "@shared/schema";
import type { InsertChannel } from "@shared/schema";

const sampleChannels: InsertChannel[] = [
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

export async function seedDatabase() {
  try {
    console.log('🌱 Seeding database with sample channels...');
    
    // Check if channels already exist
    const existingChannels = await db.select().from(channels);
    
    if (existingChannels.length === 0) {
      await db.insert(channels).values(sampleChannels);
      console.log(`✅ Successfully seeded ${sampleChannels.length} channels`);
    } else {
      console.log(`ℹ️ Database already contains ${existingChannels.length} channels, skipping seed`);
    }
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run seed if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().then(() => {
    console.log('🎉 Database seeding completed');
    process.exit(0);
  }).catch((error) => {
    console.error('💥 Database seeding failed:', error);
    process.exit(1);
  });
}