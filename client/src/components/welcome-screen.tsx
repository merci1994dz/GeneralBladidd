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
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-tv-primary to-tv-dark flex items-center justify-center p-6">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-8">
          <div className="relative inline-block">
            <Tv className="w-16 h-16 text-tv-accent mb-4 mx-auto" />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-tv-accent rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2 text-white">جنرال بلادي TV</h1>
          <p className="text-gray-300 text-lg">تطبيق البث المباشر المطور</p>
        </div>
        
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-center gap-3">
            <div className="w-2 h-2 bg-tv-accent rounded-full"></div>
            <span className="text-gray-300">دعم جميع روابط IPTV</span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Smartphone className="w-4 h-4 text-tv-accent" />
            <span className="text-gray-300">متوافق مع الهواتف الذكية</span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Globe className="w-4 h-4 text-tv-accent" />
            <span className="text-gray-300">واجهة عربية 100%</span>
          </div>
        </div>
        
        <Button 
          onClick={handleEnter} 
          disabled={isLoading}
          className="bg-tv-accent hover:bg-green-600 text-white px-8 py-3 text-lg font-semibold min-w-[200px]"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              جاري التحميل...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              ابدأ المشاهدة
            </div>
          )}
        </Button>
        
        <div className="mt-8 text-sm text-gray-400">
          <p>تطوير: <span className="text-tv-accent font-semibold">merci1994dz</span></p>
        </div>
      </div>
    </div>
  );
}
