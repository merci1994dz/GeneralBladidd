import { Heart, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCategoryColor } from "@/lib/arabic-utils";
import { cn } from "@/lib/utils";
import type { Channel } from "@shared/schema";

interface ChannelCardProps {
  channel: Channel;
  onPlay: (channel: Channel) => void;
  onToggleFavorite?: (channelId: number) => void;
  isFavorite?: boolean;
  isPlaying?: boolean;
}

export default function ChannelCard({ 
  channel, 
  onPlay, 
  onToggleFavorite, 
  isFavorite = false,
  isPlaying = false 
}: ChannelCardProps) {
  return (
    <Card className={cn(
      "bg-tv-surface hover:bg-tv-primary transition-all duration-300 cursor-pointer group border border-gray-600 hover:border-tv-accent/50 shadow-lg hover:shadow-2xl transform hover:scale-[1.02]",
      isPlaying && "ring-2 ring-tv-accent shadow-tv-accent/50"
    )}>
      <CardContent className="p-5" onClick={() => onPlay(channel)}>
        <div className="flex items-center gap-4">
          {/* Enhanced Channel logo/icon */}
          <div className={cn(
            "w-16 h-16 bg-gradient-to-br rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-white/20",
            getCategoryColor(channel.category)
          )}>
            {channel.logo ? (
              <img 
                src={channel.logo} 
                alt={channel.name}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <Radio className="w-8 h-8 text-white" />
            )}
          </div>
          
          {/* Enhanced Channel info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white truncate text-lg arabic-heading mb-1">{channel.name}</h3>
            {channel.description && (
              <p className="text-sm text-gray-300 truncate arabic-text">{channel.description}</p>
            )}
            
            {/* Enhanced Live indicator */}
            {channel.isActive && (
              <div className="flex items-center mt-2">
                <div className="w-3 h-3 bg-tv-accent rounded-full ml-2 animate-pulse shadow-lg"></div>
                <span className="text-sm text-tv-accent font-semibold arabic-text">مباشر الآن</span>
              </div>
            )}
          </div>
          
          {/* Enhanced Favorite button */}
          {onToggleFavorite && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "text-gray-400 hover:text-tv-gold transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110",
                isFavorite && "opacity-100 text-tv-gold"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(channel.id);
              }}
            >
              <Heart className={cn("w-5 h-5", isFavorite && "fill-current")} />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
