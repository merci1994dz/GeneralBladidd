import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Heart, Tv } from "lucide-react";
import WelcomeScreen from "@/components/welcome-screen";
import VideoPlayer from "@/components/video-player";
import CategoryTabs from "@/components/category-tabs";
import ChannelCard from "@/components/channel-card";
import { useToast } from "@/hooks/use-toast";
import type { Channel } from "@shared/schema";

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);

  const { toast } = useToast();

  // Fetch channels
  const { data: channels = [], isLoading } = useQuery<Channel[]>({
    queryKey: ['/api/channels'],
  });

  // Filter channels by category
  const filteredChannels = channels.filter(channel => 
    activeCategory === "all" || channel.category === activeCategory
  );

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    toast({
      title: "مرحباً بك في جنرال بلادي TV",
      description: "استمتع بمشاهدة قنواتك المفضلة",
    });
  };

  const handleChannelPlay = (channel: Channel) => {
    setCurrentChannel(channel);
    toast({
      title: `تم تشغيل ${channel.name}`,
      description: "جاري تحميل البث المباشر...",
    });
  };

  const handleToggleFavorite = (channelId: number) => {
    setFavorites(prev => 
      prev.includes(channelId) 
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    );
  };

  if (showWelcome) {
    return <WelcomeScreen onEnter={handleWelcomeComplete} />;
  }

  return (
    <div className="min-h-screen bg-tv-dark">
      {/* Top Navigation */}
      <nav className="bg-tv-primary border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Tv className="w-6 h-6 text-tv-accent" />
            <h1 className="text-lg font-bold text-white">جنرال بلادي TV</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Link href="/admin">
              <Button variant="secondary" size="sm">
                <Settings className="w-4 h-4 ml-1" />
                إدارة
              </Button>
            </Link>
            <Button variant="outline" size="sm">
              <Heart className="w-4 h-4 ml-1" />
              المفضلة ({favorites.length})
            </Button>
          </div>
        </div>
      </nav>

      {/* Category Tabs */}
      <CategoryTabs 
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Video Player */}
      <VideoPlayer channel={currentChannel} />

      {/* Channels List */}
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4 text-white">
          القنوات المتاحة ({filteredChannels.length})
        </h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-tv-surface rounded-lg p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-600 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-600 rounded mb-2"></div>
                    <div className="h-3 bg-gray-600 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChannels.map((channel) => (
              <ChannelCard
                key={channel.id}
                channel={channel}
                onPlay={handleChannelPlay}
                onToggleFavorite={handleToggleFavorite}
                isFavorite={favorites.includes(channel.id)}
                isPlaying={currentChannel?.id === channel.id}
              />
            ))}
          </div>
        )}

        {filteredChannels.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Tv className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">لا توجد قنوات في هذه الفئة</p>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 left-6">
        <Link href="/admin">
          <Button className="bg-tv-accent hover:bg-green-600 text-white w-14 h-14 rounded-full shadow-lg">
            <Plus className="w-6 h-6" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
