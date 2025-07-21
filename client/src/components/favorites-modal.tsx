import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, X, Play } from "lucide-react";
import ChannelCard from "@/components/channel-card";
import type { Channel } from "@shared/schema";

interface FavoritesModalProps {
  channels: Channel[];
  favorites: number[];
  onToggleFavorite: (channelId: number) => void;
  onPlayChannel: (channel: Channel) => void;
  currentChannelId?: number;
}

export default function FavoritesModal({ 
  channels, 
  favorites, 
  onToggleFavorite, 
  onPlayChannel,
  currentChannelId 
}: FavoritesModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const favoriteChannels = channels.filter(channel => favorites.includes(channel.id));

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="border-tv-gold text-tv-gold hover:bg-tv-gold hover:text-black transition-all duration-300 arabic-text"
        >
          <Heart className="w-4 h-4 ml-1" />
          المفضلة ({favorites.length})
        </Button>
      </DialogTrigger>
      
      <DialogContent className="bg-tv-dark border-tv-accent/30 max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white arabic-heading flex items-center gap-3">
            <Heart className="w-6 h-6 text-tv-gold" />
            قنواتي المفضلة ({favoriteChannels.length})
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-6">
          {favoriteChannels.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-tv-surface rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl text-gray-300 arabic-heading mb-2">
                لا توجد قنوات مفضلة بعد
              </h3>
              <p className="text-gray-400 arabic-text">
                انقر على أيقونة القلب لإضافة القنوات إلى قائمة المفضلة
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {favoriteChannels.map((channel) => (
                <ChannelCard
                  key={channel.id}
                  channel={channel}
                  onPlay={(channel) => {
                    onPlayChannel(channel);
                    setIsOpen(false);
                  }}
                  onToggleFavorite={onToggleFavorite}
                  isFavorite={true}
                  isPlaying={currentChannelId === channel.id}
                />
              ))}
            </div>
          )}
        </div>
        
        {favoriteChannels.length > 0 && (
          <div className="mt-6 flex justify-between items-center pt-4 border-t border-tv-accent/20">
            <span className="text-gray-400 arabic-text">
              {favoriteChannels.length} قناة في المفضلة
            </span>
            <Button 
              onClick={() => setIsOpen(false)}
              className="bg-tv-accent hover:bg-green-600 text-white arabic-text"
            >
              إغلاق
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}