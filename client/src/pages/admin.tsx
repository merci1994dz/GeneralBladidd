import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield } from "lucide-react";
import AdminPanel from "@/components/admin-panel";

export default function Admin() {
  return (
    <div className="min-h-screen bg-tv-dark">
      {/* Admin Header */}
      <div className="bg-tv-primary border-b border-gray-700 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-tv-accent" />
            <h1 className="text-xl font-bold text-white">لوحة التحكم الإدارية</h1>
          </div>
          
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowRight className="w-4 h-4 ml-1" />
              العودة للرئيسية
            </Button>
          </Link>
        </div>
      </div>

      {/* Admin Content */}
      <div className="p-6">
        <AdminPanel />
      </div>
    </div>
  );
}
