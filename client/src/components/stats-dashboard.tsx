import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { arabicCategoryNames } from "../lib/arabic-utils";

interface ViewStats {
  totalViews: number;
  uniqueIPs: number;
  totalDuration: number;
  period: string;
}

interface TopChannel {
  id: number;
  name: string;
  category: string;
  views: number;
  totalDuration: number;
}

export function StatsDashboard() {
  const [period, setPeriod] = useState('7d');
  const [authHeader] = useState(() => {
    const saved = localStorage.getItem('adminAuth');
    return saved || '';
  });

  const { data: viewStats, isLoading: loadingViews } = useQuery<ViewStats>({
    queryKey: ['viewStats', period],
    queryFn: async () => {
      const res = await fetch(`/api/stats/views?period=${period}`, {
        headers: { 'Authorization': authHeader }
      });
      if (!res.ok) throw new Error('Failed to fetch view stats');
      return res.json();
    },
    enabled: !!authHeader
  });

  const { data: topChannels, isLoading: loadingTop } = useQuery<TopChannel[]>({
    queryKey: ['topChannels'],
    queryFn: async () => {
      const res = await fetch('/api/stats/top-channels?limit=10', {
        headers: { 'Authorization': authHeader }
      });
      if (!res.ok) throw new Error('Failed to fetch top channels');
      return res.json();
    },
    enabled: !!authHeader
  });

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}س ${minutes}د`;
    return `${minutes}د`;
  };

  const getPeriodText = (p: string) => {
    switch(p) {
      case '24h': return 'آخر 24 ساعة';
      case '7d': return 'آخر 7 أيام';
      case '30d': return 'آخر 30 يوم';
      default: return 'آخر 7 أيام';
    }
  };

  if (!authHeader) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">يرجى تسجيل الدخول لعرض الإحصائيات</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex gap-2 justify-end">
        {['24h', '7d', '30d'].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              period === p
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {getPeriodText(p)}
          </button>
        ))}
      </div>

      {/* View Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 rounded-xl p-6 border border-blue-700/30">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">👁️</span>
            <h3 className="text-lg font-semibold text-gray-200">إجمالي المشاهدات</h3>
          </div>
          {loadingViews ? (
            <div className="text-2xl font-bold text-gray-400">...</div>
          ) : (
            <div className="text-3xl font-bold text-blue-400">
              {viewStats?.totalViews.toLocaleString('ar-SA') || 0}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 rounded-xl p-6 border border-green-700/30">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">👥</span>
            <h3 className="text-lg font-semibold text-gray-200">مشاهدين فريدين</h3>
          </div>
          {loadingViews ? (
            <div className="text-2xl font-bold text-gray-400">...</div>
          ) : (
            <div className="text-3xl font-bold text-green-400">
              {viewStats?.uniqueIPs.toLocaleString('ar-SA') || 0}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 rounded-xl p-6 border border-purple-700/30">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">⏱️</span>
            <h3 className="text-lg font-semibold text-gray-200">إجمالي وقت المشاهدة</h3>
          </div>
          {loadingViews ? (
            <div className="text-2xl font-bold text-gray-400">...</div>
          ) : (
            <div className="text-3xl font-bold text-purple-400">
              {viewStats ? formatDuration(viewStats.totalDuration) : '0د'}
            </div>
          )}
        </div>
      </div>

      {/* Top Channels */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>🏆</span>
          أكثر القنوات مشاهدة
        </h3>
        
        {loadingTop ? (
          <div className="text-center py-8 text-gray-400">جاري التحميل...</div>
        ) : topChannels && topChannels.length > 0 ? (
          <div className="space-y-3">
            {topChannels.map((channel, index) => (
              <div
                key={channel.id}
                className="flex items-center gap-4 bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800 transition-colors"
              >
                <div className={`text-2xl font-bold ${
                  index === 0 ? 'text-yellow-400' :
                  index === 1 ? 'text-gray-300' :
                  index === 2 ? 'text-orange-400' :
                  'text-gray-500'
                }`}>
                  #{index + 1}
                </div>
                
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{channel.name}</h4>
                  <p className="text-sm text-gray-400">
                    {arabicCategoryNames[channel.category] || channel.category}
                  </p>
                </div>
                
                <div className="text-left">
                  <div className="text-lg font-bold text-blue-400">
                    {channel.views.toLocaleString('ar-SA')}
                  </div>
                  <div className="text-xs text-gray-500">مشاهدة</div>
                </div>
                
                <div className="text-left">
                  <div className="text-lg font-bold text-purple-400">
                    {formatDuration(channel.totalDuration)}
                  </div>
                  <div className="text-xs text-gray-500">وقت المشاهدة</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            لا توجد بيانات مشاهدة حتى الآن
          </div>
        )}
      </div>
    </div>
  );
}
