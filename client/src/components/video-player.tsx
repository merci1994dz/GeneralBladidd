import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import Hls from "hls.js";

import type { Channel } from "@shared/schema";

interface VideoPlayerProps {
  channel: Channel | null;
}

export default function VideoPlayer({ channel }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState([70]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!channel || !videoRef.current) return;

    const video = videoRef.current;
    setIsLoading(true);
    setError(null);
    setIsPlaying(false);

    // Clean up previous Hls instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const loadSource = () => {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsRef.current = hls;
        hls.loadSource(channel.url);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          video.play().catch(() => {
            // Auto-play might be blocked by browser
            setIsPlaying(false);
          });
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                setError("خطأ في الشبكة: تعذر الوصول إلى رابط القناة");
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                setError("خطأ في الوسائط: الرابط قد يكون غير صالح");
                hls.recoverMediaError();
                break;
              default:
                setError("حدث خطأ غير متوقع أثناء تحميل القناة");
                hls.destroy();
                break;
            }
            setIsLoading(false);
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Native support (like Safari)
        video.src = channel.url;
        video.addEventListener("loadedmetadata", () => {
          setIsLoading(false);
          video.play().catch(() => setIsPlaying(false));
        });
        video.addEventListener("error", () => {
          setError("المتصفح لا يدعم تشغيل هذا الرابط");
          setIsLoading(false);
        });
      } else {
        setError("متصفحك لا يدعم تقنية البث المستخدمة (HLS)");
        setIsLoading(false);
      }
    };

    loadSource();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [channel]);

  // Sync isPlaying state with video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, []);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(console.error);
      }
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
      if (newVolume[0] > 0 && isMuted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    }
  };

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement;
    if (container) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        container.requestFullscreen().catch(console.error);
      }
    }
  };

  if (!channel) {
    return (
      <div className="aspect-video bg-black flex items-center justify-center rounded-xl overflow-hidden border border-white/10">
        <div className="text-center p-8">
          <div className="w-20 h-20 bg-tv-accent/20 rounded-full flex items-center justify-center mb-6 mx-auto animate-pulse">
            <Play className="w-10 h-10 text-tv-accent" />
          </div>
          <h2 className="text-white text-2xl font-bold mb-2 arabic-text">مرحباً بك في جنرال بلادي TV</h2>
          <p className="text-white/60 text-lg arabic-text">اختر قناة من القائمة أدناه لبدء البث المباشر</p>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-video bg-black relative group shadow-2xl rounded-xl overflow-hidden border border-white/10">
      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm z-10">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-tv-accent animate-spin mb-4 mx-auto" />
            <p className="text-white text-lg arabic-text">جاري الاتصال بالبث...</p>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-20 p-6">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4 mx-auto" />
            <h3 className="text-white text-xl font-bold mb-2 arabic-text">فشل تشغيل القناة</h3>
            <p className="text-white/70 mb-6 arabic-text">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              className="border-tv-accent text-tv-accent hover:bg-tv-accent hover:text-white"
            >
              إعادة تحميل الصفحة
            </Button>
          </div>
        </div>
      )}

      {/* Streaming status overlay */}
      {isPlaying && !isLoading && !error && (
        <div className="absolute top-4 left-4 bg-red-600 rounded-md px-2 py-1 flex items-center gap-2 z-10 shadow-lg">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="text-white text-xs font-bold uppercase tracking-wider">Live</span>
        </div>
      )}

      {/* Channel info overlay */}
      <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md rounded-lg px-4 py-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-white/10">
        <h3 className="text-white font-bold text-lg">{channel.name}</h3>
        <p className="text-white/70 text-sm arabic-text">{channel.category}</p>
      </div>

      {/* Controls overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              onClick={togglePlayPause}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 h-12 w-12 rounded-full"
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
            </Button>
            
            <div className="flex items-center gap-3 ml-2 group/vol">
              <Button
                onClick={toggleMute}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 h-10 w-10 rounded-full"
              >
                {isMuted || volume[0] === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
              <div className="w-0 group-hover/vol:w-24 transition-all duration-300 overflow-hidden">
                <Slider
                  value={volume}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="w-24"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 h-10 w-10 rounded-full"
            >
              <Settings className="w-5 h-5" />
            </Button>
            
            <Button
              onClick={toggleFullscreen}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 h-10 w-10 rounded-full"
            >
              <Maximize className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
