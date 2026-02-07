import { Heart, Play, Radio, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCategoryColor, getCategoryIcon, arabicCategoryNames } from "@/lib/arabic-utils";
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
    <div 
      className={cn(
        "group relative bg-tv-surface rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:bg-tv-surface-hover border border-white/5 hover:border-tv-accent/30",
        isPlaying && "ring-2 ring-tv-accent border-tv-accent/50 glow-accent"
      )}
      onClick={() => onPlay(channel)}
    >
      <div className="p-4 flex items-center gap-3">
        {/* Channel icon */}
        <div className={cn(
          "w-12 h-12 bg-gradient-to-br rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg",
          getCategoryColor(channel.category)
        )}>
          {channel.logo ? (
            <img 
              src={channel.logo} 
              alt={channel.name}
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).parentElement!.innerHTML = '<svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/></svg>';
              }}
            />
          ) : (
            <span className="text-lg">{getCategoryIcon(channel.category)}</span>
          )}
        </div>
        
        {/* Channel info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate text-sm arabic-text leading-tight">{channel.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500 arabic-text">
              {arabicCategoryNames[channel.category] || channel.category}
            </span>
            {channel.isFeatured && (
              <Star className="w-3 h-3 text-tv-gold fill-tv-gold" />
            )}
          </div>
          
          {/* Live indicator */}
          {channel.isActive && (
            <div className="flex items-center mt-1.5 gap-1.5">
              <div className="w-1.5 h-1.5 bg-tv-accent rounded-full animate-pulse"></div>
              <span className="text-[10px] text-tv-accent font-medium arabic-text">مباشر</span>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1">
          {onToggleFavorite && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "w-8 h-8 text-gray-500 hover:text-tv-gold transition-all opacity-0 group-hover:opacity-100",
                isFavorite && "opacity-100 text-tv-gold"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(channel.id);
              }}
            >
              <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
            </Button>
          )}
          
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center transition-all",
            isPlaying 
              ? "bg-tv-accent text-white" 
              : "bg-white/5 text-gray-400 group-hover:bg-tv-accent/20 group-hover:text-tv-accent"
          )}>
            <Play className="w-3.5 h-3.5 fill-current" />
          </div>
        </div>
      </div>
    </div>
  );
}
