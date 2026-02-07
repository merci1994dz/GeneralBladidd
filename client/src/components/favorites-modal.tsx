import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, Tv } from "lucide-react";
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
          variant="ghost" 
          size="icon"
          className="text-gray-400 hover:text-tv-gold hover:bg-white/10 w-9 h-9 relative"
        >
          <Heart className={`w-4 h-4 ${favorites.length > 0 ? 'text-tv-gold fill-tv-gold' : ''}`} />
          {favorites.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
              {favorites.length > 99 ? '99+' : favorites.length}
            </span>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="bg-tv-dark border-white/10 max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white arabic-heading flex items-center gap-2">
            <Heart className="w-5 h-5 text-tv-gold fill-tv-gold" />
            المفضلة ({favoriteChannels.length})
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {favoriteChannels.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-tv-surface rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-lg text-gray-300 arabic-heading mb-2">لا توجد قنوات مفضلة</h3>
              <p className="text-gray-500 text-sm arabic-text">اضغط على القلب لإضافة قنوات</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
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
      </DialogContent>
    </Dialog>
  );
}
