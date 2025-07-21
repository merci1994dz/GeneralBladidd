import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Tv, Smartphone, Globe } from "lucide-react";

interface WelcomeScreenProps {
  onEnter: () => void;
}

export default function WelcomeScreen({ onEnter }: WelcomeScreenProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleEnter = () => {
    setIsLoading(true);
    setTimeout(() => {
      onEnter();
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-tv-gradient flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border border-tv-accent rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 border border-tv-gold rounded-full"></div>
        <div className="absolute top-1/3 right-10 w-16 h-16 border border-tv-secondary rounded-full"></div>
      </div>
      
      <div className="text-center max-w-lg mx-auto relative z-10">
        <div className="mb-10">
          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 bg-tv-accent rounded-full flex items-center justify-center mb-4 mx-auto shadow-2xl">
              <Tv className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-tv-gold rounded-full flex items-center justify-center shadow-lg">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-3 text-white arabic-heading bg-gradient-to-r from-tv-gold to-tv-accent bg-clip-text text-transparent">
            جنرال بلادي TV
          </h1>
          <p className="text-gray-300 text-xl arabic-text">منصة البث المباشر الأكثر تطوراً</p>
        </div>
        
        <div className="grid grid-cols-1 gap-4 mb-10">
          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-tv-accent/20">
            <div className="flex items-center justify-center gap-3">
              <div className="w-3 h-3 bg-tv-accent rounded-full animate-pulse"></div>
              <span className="text-white arabic-text text-lg">دعم جميع روابط IPTV</span>
            </div>
          </div>
          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-tv-secondary/20">
            <div className="flex items-center justify-center gap-3">
              <Smartphone className="w-5 h-5 text-tv-secondary" />
              <span className="text-white arabic-text text-lg">متوافق مع الهواتف الذكية</span>
            </div>
          </div>
          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-tv-gold/20">
            <div className="flex items-center justify-center gap-3">
              <Globe className="w-5 h-5 text-tv-gold" />
              <span className="text-white arabic-text text-lg">واجهة عربية 100%</span>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={handleEnter} 
          disabled={isLoading}
          className="bg-gradient-to-r from-tv-accent to-green-500 hover:from-green-600 hover:to-tv-accent text-white px-10 py-4 text-xl font-bold rounded-2xl min-w-[250px] shadow-2xl transform transition-all duration-300 hover:scale-105"
        >
          {isLoading ? (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="arabic-text">جاري التحميل...</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Play className="w-6 h-6" />
              <span className="arabic-text">ابدأ المشاهدة</span>
            </div>
          )}
        </Button>
        
        <div className="mt-10 bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-tv-gold/20">
          <p className="text-tv-gold text-lg arabic-text">
            تطوير: <span className="font-bold">merci1994dz</span>
          </p>
        </div>
      </div>
    </div>
  );
}
