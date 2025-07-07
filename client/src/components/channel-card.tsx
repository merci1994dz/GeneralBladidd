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
      "bg-tv-surface hover:bg-gray-700 transition-colors cursor-pointer group",
      isPlaying && "ring-2 ring-tv-accent"
    )}>
      <CardContent className="p-4" onClick={() => onPlay(channel)}>
        <div className="flex items-center gap-3">
          {/* Channel logo/icon */}
          <div className={cn(
            "w-12 h-12 bg-gradient-to-br rounded-lg flex items-center justify-center flex-shrink-0",
            getCategoryColor(channel.category)
          )}>
            {channel.logo ? (
              <img 
                src={channel.logo} 
                alt={channel.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <Radio className="w-6 h-6 text-white" />
            )}
          </div>
          
          {/* Channel info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate">{channel.name}</h3>
            {channel.description && (
              <p className="text-sm text-gray-400 truncate">{channel.description}</p>
            )}
            
            {/* Live indicator */}
            {channel.isActive && (
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 bg-tv-accent rounded-full ml-2 animate-pulse"></div>
                <span className="text-xs text-tv-accent font-medium">مباشر</span>
              </div>
            )}
          </div>
          
          {/* Favorite button */}
          {onToggleFavorite && (
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-tv-accent transition-colors opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(channel.id);
              }}
            >
              <Heart className={cn("w-4 h-4", isFavorite && "fill-current text-tv-accent")} />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
