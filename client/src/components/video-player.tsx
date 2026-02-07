import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Loader2, AlertCircle, RefreshCw, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import Hls from "hls.js";
import type { Channel } from "@shared/schema";

interface VideoPlayerProps {
  channel: Channel | null;
}

export default function VideoPlayer({ channel }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState([80]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!channel || !videoRef.current) return;

    const video = videoRef.current;
    setIsLoading(true);
    setError(null);
    setIsPlaying(false);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const loadSource = () => {
      // Check if URL is m3u8/HLS
      const isHLS = channel.url.includes('.m3u8') || channel.url.includes('m3u');
      
      if (isHLS && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
        });
        hlsRef.current = hls;
        hls.loadSource(channel.url);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          video.play().catch(() => setIsPlaying(false));
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                setError("خطأ في الشبكة - جاري إعادة المحاولة...");
                setTimeout(() => hls.startLoad(), 3000);
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                setError("تعذر تشغيل هذه القناة");
                hls.destroy();
                break;
            }
            setIsLoading(false);
          }
        });
      } else if (!isHLS || video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = channel.url;
        video.addEventListener("loadedmetadata", () => {
          setIsLoading(false);
          video.play().catch(() => setIsPlaying(false));
        });
        video.addEventListener("error", () => {
          setError("تعذر تشغيل هذه القناة");
          setIsLoading(false);
        });
      } else {
        setError("المتصفح لا يدعم تشغيل هذا النوع من البث");
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

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play().catch(console.error);
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
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen().catch(console.error);
      }
    }
  };

  const retryLoad = () => {
    if (channel) {
      setError(null);
      setIsLoading(true);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      // Trigger re-render
      const video = videoRef.current;
      if (video) {
        video.src = '';
      }
      // Small delay then reload
      setTimeout(() => {
        if (videoRef.current && channel) {
          const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
          hlsRef.current = hls;
          hls.loadSource(channel.url);
          hls.attachMedia(videoRef.current);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setIsLoading(false);
            videoRef.current?.play().catch(() => setIsPlaying(false));
          });
          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (data.fatal) {
              setError("تعذر تشغيل هذه القناة");
              setIsLoading(false);
            }
          });
        }
      }, 500);
    }
  };

  if (!channel) {
    return (
      <div className="aspect-video bg-gradient-to-br from-tv-surface to-tv-dark flex items-center justify-center mx-4 mt-4 rounded-2xl overflow-hidden border border-white/5">
        <div className="text-center p-8">
          <div className="w-20 h-20 bg-tv-accent/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
            <Tv className="w-10 h-10 text-tv-accent" />
          </div>
          <h2 className="text-white text-xl font-bold mb-2 arabic-heading">اختر قناة للمشاهدة</h2>
          <p className="text-gray-500 arabic-text">اختر قناة من القائمة أدناه لبدء البث المباشر</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="aspect-video bg-black relative mx-4 mt-4 rounded-2xl overflow-hidden border border-white/5 shadow-2xl"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        onClick={togglePlayPause}
      />

      {/* Loading */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm z-10">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-tv-accent animate-spin mb-3 mx-auto" />
            <p className="text-white/80 arabic-text">جاري تحميل البث...</p>
            <p className="text-gray-500 text-sm arabic-text mt-1">{channel.name}</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-20 p-6">
          <div className="text-center max-w-sm">
            <AlertCircle className="w-12 h-12 text-red-400 mb-3 mx-auto" />
            <h3 className="text-white text-lg font-bold mb-2 arabic-heading">{error}</h3>
            <p className="text-gray-400 text-sm mb-4 arabic-text">قد يكون الرابط غير متاح حالياً</p>
            <Button 
              onClick={retryLoad}
              className="bg-tv-accent hover:bg-green-600 text-white arabic-text"
            >
              <RefreshCw className="w-4 h-4 ml-2" />
              إعادة المحاولة
            </Button>
          </div>
        </div>
      )}

      {/* Live badge */}
      {isPlaying && !isLoading && !error && (
        <div className="absolute top-3 left-3 bg-red-600/90 backdrop-blur-sm rounded-md px-2 py-1 flex items-center gap-1.5 z-10">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
          <span className="text-white text-[10px] font-bold uppercase tracking-wider">LIVE</span>
        </div>
      )}

      {/* Channel name */}
      <div className={`absolute top-3 right-3 bg-black/50 backdrop-blur-md rounded-lg px-3 py-1.5 z-10 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <h3 className="text-white font-semibold text-sm arabic-text">{channel.name}</h3>
      </div>

      {/* Controls */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 transition-opacity duration-300 z-30 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              onClick={togglePlayPause}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 h-10 w-10 rounded-full"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </Button>
            
            <div className="flex items-center gap-2 group/vol">
              <Button
                onClick={toggleMute}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 h-9 w-9 rounded-full"
              >
                {isMuted || volume[0] === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <div className="w-0 group-hover/vol:w-20 transition-all duration-300 overflow-hidden">
                <Slider
                  value={volume}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="w-20"
                />
              </div>
            </div>
          </div>
          
          <Button
            onClick={toggleFullscreen}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 h-9 w-9 rounded-full"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
