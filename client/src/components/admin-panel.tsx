import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Save, Plus, Edit, Trash2, TrendingUp, Activity, Search, X,
  Upload, Download, ToggleLeft, ToggleRight, Star, StarOff,
  Tv, Radio, ChevronLeft, ChevronRight, AlertTriangle, Check, BarChart3
} from "lucide-react";
import { formatArabicNumber, arabicCategoryNames, getCategoryIcon } from "@/lib/arabic-utils";
import { StatsDashboard } from "./stats-dashboard";
import type { Channel, InsertChannel } from "@shared/schema";

const ITEMS_PER_PAGE = 20;

export default function AdminPanel() {
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [formData, setFormData] = useState<InsertChannel>({
    name: "",
    url: "",
    category: "sports",
    country: "other",
    description: "",
    logo: "",
    isActive: true,
    isFeatured: false
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'channels' | 'add' | 'import' | 'stats'>('overview');
  const [m3uUrl, setM3uUrl] = useState("");
  const [m3uText, setM3uText] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: channels = [] } = useQuery<Channel[]>({
    queryKey: ['/api/channels'],
  });

  const { data: stats } = useQuery<any>({
    queryKey: ['/api/stats'],
  });

  // Filter and search
  const filteredChannels = useMemo(() => {
    let result = channels;
    if (filterCategory !== "all") {
      result = result.filter(ch => ch.category === filterCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(ch => 
        ch.name.toLowerCase().includes(q) ||
        ch.url.toLowerCase().includes(q)
      );
    }
    return result;
  }, [channels, filterCategory, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredChannels.length / ITEMS_PER_PAGE);
  const paginatedChannels = filteredChannels.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Mutations
  const createChannelMutation = useMutation({
    mutationFn: async (data: InsertChannel) => {
      const response = await apiRequest("POST", "/api/channels", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/channels'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({ title: "تم إضافة القناة بنجاح" });
      resetForm();
    },
    onError: () => {
      toast({ title: "خطأ في إضافة القناة", variant: "destructive" });
    }
  });

  const updateChannelMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertChannel> }) => {
      const response = await apiRequest("PUT", `/api/channels/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/channels'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({ title: "تم تحديث القناة بنجاح" });
      setEditingChannel(null);
      resetForm();
    },
    onError: () => {
      toast({ title: "خطأ في تحديث القناة", variant: "destructive" });
    }
  });

  const deleteChannelMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/channels/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/channels'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({ title: "تم حذف القناة" });
      setDeleteConfirm(null);
    },
    onError: () => {
      toast({ title: "خطأ في حذف القناة", variant: "destructive" });
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PATCH", `/api/channels/${id}/toggle`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/channels'] });
    }
  });

  const toggleFeatureMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PATCH", `/api/channels/${id}/feature`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/channels'] });
    }
  });

  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/channels");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/channels'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({ title: "تم حذف جميع القنوات" });
    }
  });

  const resetForm = () => {
    setFormData({
      name: "", url: "", category: "sports", country: "other",
      description: "", logo: "", isActive: true, isFeatured: false
    });
    setEditingChannel(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingChannel) {
      updateChannelMutation.mutate({ id: editingChannel.id, data: formData });
    } else {
      createChannelMutation.mutate(formData);
    }
  };

  const handleEdit = (channel: Channel) => {
    setEditingChannel(channel);
    setFormData({
      name: channel.name,
      url: channel.url,
      category: channel.category,
      country: channel.country || "other",
      description: channel.description || "",
      logo: channel.logo || "",
      isActive: channel.isActive,
      isFeatured: channel.isFeatured
    });
    setActiveTab('add');
  };

  // Parse M3U text
  const parseM3U = (text: string): InsertChannel[] => {
    const lines = text.split('\n');
    const parsed: InsertChannel[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('#EXTINF:')) {
        const commaIdx = line.lastIndexOf(',');
        const name = commaIdx !== -1 ? line.substring(commaIdx + 1).trim() : 'Unknown';
        
        let logo = '';
        const logoMatch = line.match(/tvg-logo="([^"]*)"/);
        if (logoMatch) logo = logoMatch[1];
        
        let group = 'other';
        const groupMatch = line.match(/group-title="([^"]*)"/);
        if (groupMatch) group = groupMatch[1];
        
        // Get URL
        if (i + 1 < lines.length) {
          const url = lines[i + 1].trim();
          if (url && !url.startsWith('#')) {
            parsed.push({
              name,
              url,
              category: categorizeByName(name),
              country: "other",
              description: "",
              logo: logo || "",
              isActive: true,
              isFeatured: false
            });
            i++;
          }
        }
      }
    }
    return parsed;
  };

  const categorizeByName = (name: string): string => {
    const n = name.toLowerCase();
    if (/sport|bein|football|soccer|match|league|دوري|رياض|كورة|ضد\b|vs\b/i.test(n)) return 'sports';
    if (/^alg|algeri|entv|echorouk|ennahar|dzair|جزائر/i.test(n)) return 'algerian';
    if (/^mar|maroc|2m\b|medi.*1|تمازيغت|مغرب/i.test(n)) return 'moroccan';
    if (/^tun|tunis|nessma|نسمة|حنبعل|تونس/i.test(n)) return 'tunisian';
    if (/news|jazeera|arabiya|الجزيرة|العربية|أخبار|cnn|bbc/i.test(n)) return 'news';
    if (/kids|cartoon|disney|nick|أطفال|طيور|spacetoon|mbc.*3/i.test(n)) return 'kids';
    if (/quran|قرآن|sunnah|iqraa|إقرأ|mecca|مكة|دين|islam/i.test(n)) return 'religious';
    if (/document|discovery|nat.*geo|history|وثائق/i.test(n)) return 'documentary';
    if (/music|موسيق|mtv|melody|مزيكا|radio/i.test(n)) return 'music';
    if (/^fr[:\s]|france|tf1|m6\b|canal\+|bfm/i.test(n)) return 'french';
    if (/^tr[:\s]|turk|trt\b|kanal.*d|تركي/i.test(n)) return 'turkish';
    if (/mbc|rotana|drama|cinema|movie|film|أفلام|ترفيه|دراما/i.test(n)) return 'entertainment';
    return 'other';
  };

  const handleImportM3U = async () => {
    setImportLoading(true);
    try {
      let text = m3uText;
      
      if (m3uUrl && !text) {
        const response = await fetch(m3uUrl);
        text = await response.text();
      }
      
      if (!text) {
        toast({ title: "الرجاء إدخال رابط أو محتوى M3U", variant: "destructive" });
        setImportLoading(false);
        return;
      }
      
      const parsed = parseM3U(text);
      
      if (parsed.length === 0) {
        toast({ title: "لم يتم العثور على قنوات في الملف", variant: "destructive" });
        setImportLoading(false);
        return;
      }
      
      // Bulk import in batches
      const batchSize = 50;
      let created = 0;
      
      for (let i = 0; i < parsed.length; i += batchSize) {
        const batch = parsed.slice(i, i + batchSize);
        try {
          const response = await apiRequest("POST", "/api/channels/bulk", { channels: batch });
          const result = await response.json();
          created += result.created;
        } catch (e) {
          console.error('Batch error:', e);
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/channels'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({ title: `تم استيراد ${created} قناة بنجاح` });
      setM3uUrl("");
      setM3uText("");
    } catch (error) {
      toast({ title: "خطأ في استيراد القنوات", variant: "destructive" });
    }
    setImportLoading(false);
  };

  // Export channels as M3U
  const handleExportM3U = () => {
    let m3u = "#EXTM3U\n";
    for (const ch of channels) {
      m3u += `#EXTINF:-1 tvg-logo="${ch.logo || ''}" group-title="${arabicCategoryNames[ch.category] || ch.category}",${ch.name}\n`;
      m3u += `${ch.url}\n`;
    }
    const blob = new Blob([m3u], { type: 'audio/x-mpegurl' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'channels.m3u';
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "تم تصدير القنوات بنجاح" });
  };

  const categories = ['all', 'sports', 'algerian', 'moroccan', 'tunisian', 'news', 'kids', 'entertainment', 'religious', 'documentary', 'music', 'french', 'turkish', 'other'];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'overview' as const, label: 'نظرة عامة', icon: TrendingUp },
          { id: 'stats' as const, label: 'إحصائيات المشاهدة', icon: BarChart3 },
          { id: 'channels' as const, label: 'إدارة القنوات', icon: Tv },
          { id: 'add' as const, label: editingChannel ? 'تعديل قناة' : 'إضافة قناة', icon: Plus },
          { id: 'import' as const, label: 'استيراد / تصدير', icon: Upload },
        ].map(tab => (
          <Button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            variant="ghost"
            className={`px-4 py-2 rounded-xl arabic-text whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-tv-accent text-white' 
                : 'bg-tv-surface text-gray-400 hover:text-white hover:bg-tv-surface-hover'
            }`}
          >
            <tab.icon className="w-4 h-4 ml-2" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-tv-surface border-white/5">
              <CardContent className="p-4 text-center">
                <Tv className="w-8 h-8 text-tv-accent mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{formatArabicNumber(stats?.totalChannels || channels.length)}</div>
                <div className="text-xs text-gray-500 arabic-text">إجمالي القنوات</div>
              </CardContent>
            </Card>
            <Card className="bg-tv-surface border-white/5">
              <CardContent className="p-4 text-center">
                <Activity className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{formatArabicNumber(stats?.activeChannels || 0)}</div>
                <div className="text-xs text-gray-500 arabic-text">قنوات نشطة</div>
              </CardContent>
            </Card>
            <Card className="bg-tv-surface border-white/5">
              <CardContent className="p-4 text-center">
                <Star className="w-8 h-8 text-tv-gold mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{formatArabicNumber(stats?.featuredChannels || 0)}</div>
                <div className="text-xs text-gray-500 arabic-text">قنوات مميزة</div>
              </CardContent>
            </Card>
            <Card className="bg-tv-surface border-white/5">
              <CardContent className="p-4 text-center">
                <Radio className="w-8 h-8 text-tv-secondary mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{formatArabicNumber(stats?.categoryCount || 0)}</div>
                <div className="text-xs text-gray-500 arabic-text">تصنيفات</div>
              </CardContent>
            </Card>
          </div>

          {/* Categories breakdown */}
          <Card className="bg-tv-surface border-white/5">
            <CardHeader>
              <CardTitle className="text-white arabic-heading text-lg">توزيع القنوات حسب التصنيف</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {stats?.categories && Object.entries(stats.categories as Record<string, number>)
                  .sort(([,a], [,b]) => (b as number) - (a as number))
                  .map(([cat, count]) => (
                    <div key={cat} className="bg-tv-dark rounded-lg p-3 flex items-center gap-3">
                      <span className="text-xl">{getCategoryIcon(cat)}</span>
                      <div>
                        <div className="text-white font-medium text-sm arabic-text">{arabicCategoryNames[cat] || cat}</div>
                        <div className="text-gray-500 text-xs">{formatArabicNumber(count as number)} قناة</div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === 'stats' && (
        <StatsDashboard />
      )}

      {/* Channels Management Tab */}
      {activeTab === 'channels' && (
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="ابحث عن قناة..."
                className="bg-tv-surface border-white/10 text-white pr-10 arabic-text"
              />
            </div>
            <Select value={filterCategory} onValueChange={(v) => { setFilterCategory(v); setCurrentPage(1); }}>
              <SelectTrigger className="bg-tv-surface border-white/10 text-white w-full md:w-48 arabic-text">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {getCategoryIcon(cat)} {arabicCategoryNames[cat] || cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results info */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 arabic-text">
              {formatArabicNumber(filteredChannels.length)} قناة
              {filterCategory !== 'all' && ` في ${arabicCategoryNames[filterCategory]}`}
            </span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 arabic-text text-xs"
                onClick={() => {
                  if (confirm("هل أنت متأكد من حذف جميع القنوات؟")) {
                    deleteAllMutation.mutate();
                  }
                }}
              >
                <Trash2 className="w-3 h-3 ml-1" />
                حذف الكل
              </Button>
            </div>
          </div>

          {/* Channels list */}
          <div className="space-y-2">
            {paginatedChannels.map((channel) => (
              <div key={channel.id} className="bg-tv-surface rounded-lg p-3 flex items-center gap-3 group hover:bg-tv-surface-hover transition-colors border border-white/5">
                <div className="w-10 h-10 bg-tv-dark rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">{getCategoryIcon(channel.category)}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-white text-sm truncate arabic-text">{channel.name}</h4>
                    {channel.isFeatured && <Star className="w-3 h-3 text-tv-gold fill-tv-gold flex-shrink-0" />}
                    {!channel.isActive && <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded arabic-text flex-shrink-0">معطلة</span>}
                  </div>
                  <p className="text-xs text-gray-600 truncate" dir="ltr">{channel.url}</p>
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-7 h-7 text-gray-500 hover:text-tv-gold"
                    onClick={() => toggleFeatureMutation.mutate(channel.id)}
                    title={channel.isFeatured ? "إزالة من المميزة" : "إضافة للمميزة"}
                  >
                    {channel.isFeatured ? <StarOff className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-7 h-7 text-gray-500 hover:text-green-400"
                    onClick={() => toggleActiveMutation.mutate(channel.id)}
                    title={channel.isActive ? "تعطيل" : "تفعيل"}
                  >
                    {channel.isActive ? <ToggleRight className="w-3.5 h-3.5 text-green-400" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-7 h-7 text-gray-500 hover:text-tv-secondary"
                    onClick={() => handleEdit(channel)}
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  {deleteConfirm === channel.id ? (
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="w-7 h-7 text-red-400 hover:text-red-300"
                        onClick={() => deleteChannelMutation.mutate(channel.id)}>
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="w-7 h-7 text-gray-500 hover:text-white"
                        onClick={() => setDeleteConfirm(null)}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-7 h-7 text-gray-500 hover:text-red-400"
                      onClick={() => setDeleteConfirm(channel.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 text-gray-400"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <span className="text-gray-400 text-sm arabic-text">
                {formatArabicNumber(currentPage)} / {formatArabicNumber(totalPages)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 text-gray-400"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Channel Tab */}
      {activeTab === 'add' && (
        <Card className="bg-tv-surface border-white/5">
          <CardHeader>
            <CardTitle className="text-white arabic-heading flex items-center gap-2">
              {editingChannel ? <Edit className="w-5 h-5 text-tv-secondary" /> : <Plus className="w-5 h-5 text-tv-accent" />}
              {editingChannel ? "تعديل القناة" : "إضافة قناة جديدة"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400 arabic-text text-sm">اسم القناة *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-tv-dark text-white border-white/10 arabic-text"
                    placeholder="مثال: beIN Sports 1"
                    required
                  />
                </div>
                <div>
                  <Label className="text-gray-400 arabic-text text-sm">رابط البث *</Label>
                  <Input
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="bg-tv-dark text-white border-white/10"
                    placeholder="https://example.com/stream.m3u8"
                    dir="ltr"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400 arabic-text text-sm">التصنيف</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="bg-tv-dark text-white border-white/10 arabic-text">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c !== 'all').map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {getCategoryIcon(cat)} {arabicCategoryNames[cat]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-400 arabic-text text-sm">رابط الشعار (اختياري)</Label>
                  <Input
                    value={formData.logo || ""}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    className="bg-tv-dark text-white border-white/10"
                    placeholder="https://example.com/logo.png"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <Label className="text-gray-400 arabic-text text-sm">الوصف (اختياري)</Label>
                <Input
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-tv-dark text-white border-white/10 arabic-text"
                  placeholder="وصف مختصر للقناة"
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive ?? true}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-gray-400 text-sm arabic-text">نشطة</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured ?? false}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-gray-400 text-sm arabic-text">مميزة</span>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  className="bg-tv-accent hover:bg-green-600 text-white flex-1 arabic-text"
                  disabled={createChannelMutation.isPending || updateChannelMutation.isPending}
                >
                  <Save className="w-4 h-4 ml-2" />
                  {editingChannel ? "تحديث" : "حفظ"}
                </Button>
                {editingChannel && (
                  <Button type="button" variant="outline" onClick={resetForm} className="border-white/10 text-gray-400 arabic-text">
                    إلغاء
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Import/Export Tab */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          {/* Import from URL */}
          <Card className="bg-tv-surface border-white/5">
            <CardHeader>
              <CardTitle className="text-white arabic-heading flex items-center gap-2">
                <Upload className="w-5 h-5 text-tv-accent" />
                استيراد قنوات من رابط M3U
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-400 arabic-text text-sm">رابط ملف M3U</Label>
                <Input
                  value={m3uUrl}
                  onChange={(e) => setM3uUrl(e.target.value)}
                  className="bg-tv-dark text-white border-white/10"
                  placeholder="https://example.com/playlist.m3u"
                  dir="ltr"
                />
              </div>
              <div>
                <Label className="text-gray-400 arabic-text text-sm">أو الصق محتوى M3U مباشرة</Label>
                <textarea
                  value={m3uText}
                  onChange={(e) => setM3uText(e.target.value)}
                  className="w-full h-32 bg-tv-dark text-white border border-white/10 rounded-lg p-3 text-sm resize-none"
                  placeholder="#EXTM3U&#10;#EXTINF:-1,Channel Name&#10;http://example.com/stream.m3u8"
                  dir="ltr"
                />
              </div>
              <Button
                onClick={handleImportM3U}
                disabled={importLoading || (!m3uUrl && !m3uText)}
                className="bg-tv-accent hover:bg-green-600 text-white arabic-text"
              >
                {importLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري الاستيراد...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    استيراد القنوات
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Export */}
          <Card className="bg-tv-surface border-white/5">
            <CardHeader>
              <CardTitle className="text-white arabic-heading flex items-center gap-2">
                <Download className="w-5 h-5 text-tv-secondary" />
                تصدير القنوات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-sm arabic-text mb-4">
                تصدير جميع القنوات ({formatArabicNumber(channels.length)}) كملف M3U
              </p>
              <Button
                onClick={handleExportM3U}
                disabled={channels.length === 0}
                className="bg-tv-secondary hover:bg-blue-600 text-white arabic-text"
              >
                <Download className="w-4 h-4 ml-2" />
                تحميل ملف M3U
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="bg-tv-surface border-red-500/20">
            <CardHeader>
              <CardTitle className="text-red-400 arabic-heading flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                منطقة الخطر
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-sm arabic-text mb-4">
                حذف جميع القنوات من قاعدة البيانات. هذا الإجراء لا يمكن التراجع عنه.
              </p>
              <Button
                onClick={() => {
                  if (confirm("هل أنت متأكد؟ سيتم حذف جميع القنوات نهائياً!")) {
                    deleteAllMutation.mutate();
                  }
                }}
                variant="destructive"
                className="arabic-text"
              >
                <Trash2 className="w-4 h-4 ml-2" />
                حذف جميع القنوات
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
