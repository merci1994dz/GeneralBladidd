import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Tv, Wifi, Globe, Zap, Shield } from "lucide-react";

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
    <div className="min-h-screen bg-tv-gradient flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[10%] left-[10%] w-64 h-64 bg-tv-accent/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[20%] right-[15%] w-48 h-48 bg-tv-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-[50%] left-[50%] w-96 h-96 bg-tv-gold/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>
      
      <div className="text-center max-w-xl mx-auto relative z-10">
        {/* Logo */}
        <div className="mb-8 animate-fade-in-up">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-tv-accent to-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl glow-accent rotate-3 hover:rotate-0 transition-transform duration-500">
              <Tv className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <span className="text-white text-xs font-bold">LIVE</span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black mb-3 arabic-heading">
            <span className="bg-gradient-to-r from-white via-tv-gold to-tv-accent bg-clip-text text-transparent">
              جنرال بلادي
            </span>
            <span className="text-tv-accent"> TV</span>
          </h1>
          <p className="text-gray-400 text-xl arabic-text">منصة البث المباشر العربية</p>
        </div>
        
        {/* Features */}
        <div className="grid grid-cols-2 gap-3 mb-8" style={{ animationDelay: '0.2s' }}>
          {[
            { icon: Wifi, text: "+4000 قناة مباشرة", color: "text-tv-accent" },
            { icon: Globe, text: "قنوات عربية وعالمية", color: "text-tv-secondary" },
            { icon: Zap, text: "بث بجودة عالية", color: "text-tv-gold" },
            { icon: Shield, text: "مجاني بالكامل", color: "text-emerald-400" },
          ].map((feature, i) => (
            <div key={i} className="glass-effect rounded-xl p-3 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center justify-center gap-2">
                <feature.icon className={`w-4 h-4 ${feature.color}`} />
                <span className="text-white/90 arabic-text text-sm">{feature.text}</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* CTA Button */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <Button 
            onClick={handleEnter} 
            disabled={isLoading}
            className="bg-gradient-to-r from-tv-accent to-emerald-500 hover:from-emerald-600 hover:to-tv-accent text-white px-12 py-6 text-xl font-bold rounded-2xl min-w-[280px] shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-green-500/25 glow-accent"
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="arabic-text">جاري التحميل...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Play className="w-6 h-6 fill-current" />
                <span className="arabic-text">ابدأ المشاهدة</span>
              </div>
            )}
          </Button>
        </div>
        
        {/* Footer */}
        <div className="mt-8 glass-effect rounded-xl p-3 inline-block">
          <p className="text-gray-400 text-sm arabic-text">
            تطوير بواسطة <span className="text-tv-gold font-bold">merci1994dz</span>
          </p>
        </div>
      </div>
    </div>
  );
}
