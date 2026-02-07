import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Heart, Tv, Search, X, ChevronUp } from "lucide-react";
import WelcomeScreen from "@/components/welcome-screen";
import VideoPlayer from "@/components/video-player";
import CategoryTabs from "@/components/category-tabs";
import ChannelCard from "@/components/channel-card";
import FavoritesModal from "@/components/favorites-modal";
import { DataSaverToggle } from "@/components/data-saver-toggle";
import { useToast } from "@/hooks/use-toast";
import { formatArabicNumber } from "@/lib/arabic-utils";
import type { Channel } from "@shared/schema";

const CHANNELS_PER_PAGE = 60;

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('tv-favorites');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [visibleCount, setVisibleCount] = useState(CHANNELS_PER_PAGE);

  const { toast } = useToast();

  const { data: channels = [], isLoading } = useQuery<Channel[]>({
    queryKey: ['/api/channels'],
  });

  // Compute category counts
  const channelCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const ch of channels) {
      counts[ch.category] = (counts[ch.category] || 0) + 1;
    }
    return counts;
  }, [channels]);

  // Filter channels
  const filteredChannels = useMemo(() => {
    let result = channels;
    
    if (activeCategory !== "all") {
      result = result.filter(ch => ch.category === activeCategory);
    }
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(ch => 
        ch.name.toLowerCase().includes(q) ||
        (ch.description && ch.description.toLowerCase().includes(q))
      );
    }
    
    return result;
  }, [channels, activeCategory, searchQuery]);

  const visibleChannels = filteredChannels.slice(0, visibleCount);
  const hasMore = visibleCount < filteredChannels.length;

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
  };

  const handleChannelPlay = (channel: Channel) => {
    setCurrentChannel(channel);
    // Scroll to top to see the player
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleFavorite = (channelId: number) => {
    setFavorites(prev => {
      const next = prev.includes(channelId) 
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId];
      localStorage.setItem('tv-favorites', JSON.stringify(next));
      return next;
    });
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setVisibleCount(CHANNELS_PER_PAGE);
  };

  if (showWelcome) {
    return <WelcomeScreen onEnter={handleWelcomeComplete} />;
  }

  return (
    <div className="min-h-screen bg-tv-dark">
      {/* Top Navigation */}
      <nav className="bg-tv-primary/80 backdrop-blur-xl border-b border-white/5 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-tv-accent to-emerald-600 rounded-lg flex items-center justify-center">
              <Tv className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white arabic-heading leading-tight">جنرال بلادي TV</h1>
              <p className="text-tv-accent text-[10px] arabic-text">البث المباشر</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-white/10 w-9 h-9"
              onClick={() => setShowSearch(!showSearch)}
            >
              {showSearch ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            </Button>
            
            <FavoritesModal
              channels={channels}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onPlayChannel={handleChannelPlay}
              currentChannelId={currentChannel?.id}
            />
            
            <DataSaverToggle />
            
            <Link href="/admin">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10 w-9 h-9">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Search bar */}
        {showSearch && (
          <div className="mt-3 max-w-7xl mx-auto animate-fade-in-up">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(CHANNELS_PER_PAGE);
                }}
                placeholder="ابحث عن قناة..."
                className="bg-tv-surface border-white/10 text-white pr-10 arabic-text placeholder:text-gray-600"
                autoFocus
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 text-gray-500 hover:text-white"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Category Tabs */}
      <CategoryTabs 
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        channelCounts={channelCounts}
      />

      {/* Video Player */}
      <VideoPlayer channel={currentChannel} />

      {/* Channels Grid */}
      <div className="p-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white arabic-heading">
            القنوات
            <span className="text-gray-500 font-normal mr-2 text-sm">
              ({formatArabicNumber(filteredChannels.length)})
            </span>
          </h2>
          {searchQuery && (
            <span className="text-xs text-gray-500 arabic-text">
              نتائج البحث عن "{searchQuery}"
            </span>
          )}
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-tv-surface rounded-xl p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-700 rounded-lg shimmer"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-700 rounded mb-2 shimmer"></div>
                    <div className="h-3 bg-gray-700 rounded w-2/3 shimmer"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {visibleChannels.map((channel, index) => (
                <div key={channel.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(index * 20, 500)}ms` }}>
                  <ChannelCard
                    channel={channel}
                    onPlay={handleChannelPlay}
                    onToggleFavorite={handleToggleFavorite}
                    isFavorite={favorites.includes(channel.id)}
                    isPlaying={currentChannel?.id === channel.id}
                  />
                </div>
              ))}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="text-center mt-6">
                <Button
                  onClick={() => setVisibleCount(prev => prev + CHANNELS_PER_PAGE)}
                  variant="outline"
                  className="border-white/10 text-gray-400 hover:text-white hover:bg-tv-surface arabic-text"
                >
                  عرض المزيد ({formatArabicNumber(filteredChannels.length - visibleCount)} قناة متبقية)
                </Button>
              </div>
            )}
          </>
        )}

        {filteredChannels.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <Tv className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 arabic-text">لا توجد قنوات مطابقة</p>
          </div>
        )}
      </div>

      {/* Scroll to top */}
      {visibleCount > CHANNELS_PER_PAGE && (
        <Button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 left-6 w-10 h-10 rounded-full bg-tv-accent hover:bg-green-600 text-white shadow-lg z-40"
          size="icon"
        >
          <ChevronUp className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}
