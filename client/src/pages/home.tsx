import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Heart, Tv } from "lucide-react";
import WelcomeScreen from "@/components/welcome-screen";
import VideoPlayer from "@/components/video-player";
import CategoryTabs from "@/components/category-tabs";
import ChannelCard from "@/components/channel-card";
import FavoritesModal from "@/components/favorites-modal";
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
      {/* Enhanced Top Navigation */}
      <nav className="bg-tv-gradient border-b-2 border-tv-accent/30 px-4 py-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-tv-accent rounded-full flex items-center justify-center">
              <Tv className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white arabic-heading">جنرال بلادي TV</h1>
              <p className="text-tv-gold text-sm arabic-text">منصة البث المباشر</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="secondary" size="sm" className="bg-tv-surface hover:bg-tv-secondary text-white">
                <Settings className="w-4 h-4 ml-1" />
                <span className="arabic-text">إدارة</span>
              </Button>
            </Link>
            <FavoritesModal
              channels={channels}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onPlayChannel={handleChannelPlay}
              currentChannelId={currentChannel?.id}
            />
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

      {/* Enhanced Channels List */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white arabic-heading">
            القنوات المتاحة ({filteredChannels.length})
          </h2>
          <div className="flex items-center gap-2 text-tv-accent">
            <div className="w-2 h-2 bg-tv-accent rounded-full animate-pulse"></div>
            <span className="text-sm arabic-text">متاح الآن</span>
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-tv-surface rounded-xl p-5 animate-pulse border border-gray-600">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gray-600 rounded-xl shimmer"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-600 rounded-lg mb-3 shimmer"></div>
                    <div className="h-4 bg-gray-600 rounded-lg w-3/4 shimmer"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
