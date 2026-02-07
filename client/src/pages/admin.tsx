import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Tv } from "lucide-react";
import AdminPanel from "@/components/admin-panel";

export default function Admin() {
  return (
    <div className="min-h-screen bg-tv-dark">
      {/* Admin Header */}
      <div className="bg-tv-primary/80 backdrop-blur-xl border-b border-white/5 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-tv-secondary to-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white arabic-heading leading-tight">لوحة التحكم</h1>
              <p className="text-tv-secondary text-[10px] arabic-text">إدارة القنوات والإعدادات</p>
            </div>
          </div>
          
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10 arabic-text">
              <ArrowRight className="w-4 h-4 ml-1" />
              الرئيسية
            </Button>
          </Link>
        </div>
      </div>

      {/* Admin Content */}
      <div className="p-4 max-w-7xl mx-auto">
        <AdminPanel />
      </div>
    </div>
  );
}
