import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

import type { Channel } from "@shared/schema";

interface VideoPlayerProps {
  channel: Channel | null;
}

export default function VideoPlayer({ channel }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState([50]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (channel && videoRef.current) {
      setIsLoading(true);
      setError(null);
      
      // Simulate loading delay
      setTimeout(() => {
        setIsLoading(false);
        setIsPlaying(true);
      }, 1500);
    }
  }, [channel]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume[0] / 100;
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  if (!channel) {
    return (
      <div className="aspect-video bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-tv-accent/20 rounded-full flex items-center justify-center mb-4 mx-auto">
            <Play className="w-8 h-8 text-tv-accent" />
          </div>
          <p className="text-white/80 text-lg">اختر قناة للبدء في المشاهدة</p>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-video bg-tv-gradient relative group shadow-2xl border-b-4 border-tv-accent/50">
      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover rounded-t-lg"
        poster={`https://via.placeholder.com/1280x720/1e293b/10b981?text=${encodeURIComponent(channel.name)}`}
      >
        <source src={channel.url} type="application/x-mpegURL" />
        <span className="arabic-text">المتصفح لا يدعم تشغيل الفيديو</span>
      </video>

      {/* Enhanced Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-tv-gradient flex items-center justify-center backdrop-blur-sm">
          <div className="text-center bg-black/50 rounded-2xl p-8 border border-tv-accent/30">
            <Loader2 className="w-16 h-16 text-tv-accent animate-spin mb-6 mx-auto" />
            <p className="text-white text-xl arabic-text font-semibold">جاري تحميل {channel.name}...</p>
            <div className="mt-4 flex justify-center">
              <div className="w-48 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-tv-accent to-tv-secondary animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4 mx-auto">
              <VolumeX className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-white text-lg mb-2">خطأ في تحميل القناة</p>
            <p className="text-white/60">{error}</p>
          </div>
        </div>
      )}

      {/* Streaming status overlay */}
      {isPlaying && !isLoading && (
        <div className="absolute top-4 left-4 bg-tv-accent/90 backdrop-blur-sm rounded-lg px-3 py-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-white text-sm font-medium">مباشر</span>
          </div>
        </div>
      )}

      {/* Channel info overlay */}
      {channel && (
        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2">
          <h3 className="text-white font-semibold">{channel.name}</h3>
          {channel.description && (
            <p className="text-white/80 text-sm arabic-text">{channel.description}</p>
          )}
        </div>
      )}

      {/* Controls overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={togglePlayPause}
              variant="ghost"
              size="icon"
              className="text-white hover:text-tv-accent hover:bg-white/20"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </Button>
            
            <Button
              onClick={toggleMute}
              variant="ghost"
              size="icon"
              className="text-white hover:text-tv-accent hover:bg-white/20"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </Button>
            
            <div className="w-24">
              <Slider
                value={volume}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-tv-accent hover:bg-white/20"
            >
              <Settings className="w-5 h-5" />
            </Button>
            
            <Button
              onClick={toggleFullscreen}
              variant="ghost"
              size="icon"
              className="text-white hover:text-tv-accent hover:bg-white/20"
            >
              <Maximize className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
