import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Save, Plus, Edit, Trash2, TrendingUp, Users, Play, Activity } from "lucide-react";
import { formatArabicNumber } from "@/lib/arabic-utils";
import type { Channel, InsertChannel } from "@shared/schema";

export default function AdminPanel() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [formData, setFormData] = useState<InsertChannel>({
    name: "",
    url: "",
    category: "sports",
    description: "",
    logo: "",
    isActive: true
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch channels
  const { data: channels = [] } = useQuery<Channel[]>({
    queryKey: ['/api/channels'],
  });

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
  });

  // Create channel mutation
  const createChannelMutation = useMutation({
    mutationFn: async (data: InsertChannel) => {
      const response = await apiRequest("POST", "/api/channels", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/channels'] });
      toast({
        title: "تم إنشاء القناة بنجاح",
        description: "تم إضافة القناة الجديدة إلى النظام",
      });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "خطأ في إنشاء القناة",
        description: "حدث خطأ أثناء إضافة القناة",
        variant: "destructive",
      });
    }
  });

  // Update channel mutation
  const updateChannelMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertChannel> }) => {
      const response = await apiRequest("PUT", `/api/channels/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/channels'] });
      toast({
        title: "تم تحديث القناة بنجاح",
        description: "تم حفظ التغييرات على القناة",
      });
      setEditingChannel(null);
      resetForm();
    },
    onError: () => {
      toast({
        title: "خطأ في تحديث القناة",
        description: "حدث خطأ أثناء تحديث القناة",
        variant: "destructive",
      });
    }
  });

  // Delete channel mutation
  const deleteChannelMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/channels/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/channels'] });
      toast({
        title: "تم حذف القناة بنجاح",
        description: "تم إزالة القناة من النظام",
      });
    },
    onError: () => {
      toast({
        title: "خطأ في حذف القناة",
        description: "حدث خطأ أثناء حذف القناة",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      url: "",
      category: "sports",
      description: "",
      logo: "",
      isActive: true
    });
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
      description: channel.description || "",
      logo: channel.logo || "",
      isActive: channel.isActive
    });
  };

  const handleDelete = (channelId: number) => {
    if (confirm("هل أنت متأكد من حذف هذه القناة؟")) {
      deleteChannelMutation.mutate(channelId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-tv-surface border-gray-700">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-tv-accent mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {formatArabicNumber(stats?.totalChannels || channels.length)}
            </div>
            <div className="text-sm text-gray-400">إجمالي القنوات</div>
          </CardContent>
        </Card>

        <Card className="bg-tv-surface border-gray-700">
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-tv-secondary mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {formatArabicNumber(stats?.activeUsers || 1432)}
            </div>
            <div className="text-sm text-gray-400">المستخدمون النشطون</div>
          </CardContent>
        </Card>

        <Card className="bg-tv-surface border-gray-700">
          <CardContent className="p-4 text-center">
            <Play className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {formatArabicNumber(stats?.todayViews || 856)}
            </div>
            <div className="text-sm text-gray-400">المشاهدات اليوم</div>
          </CardContent>
        </Card>

        <Card className="bg-tv-surface border-gray-700">
          <CardContent className="p-4 text-center">
            <Activity className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {stats?.uptime || "98%"}
            </div>
            <div className="text-sm text-gray-400">وقت التشغيل</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add/Edit Channel Form */}
        <Card className="bg-tv-surface border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-tv-accent" />
              {editingChannel ? "تحديث القناة" : "إضافة قناة جديدة"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-gray-300">اسم القناة</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-tv-dark text-white border-gray-600 focus:border-tv-accent"
                  placeholder="مثال: قناة الجزيرة"
                  required
                />
              </div>

              <div>
                <Label htmlFor="url" className="text-gray-300">رابط البث (m3u8)</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="bg-tv-dark text-white border-gray-600 focus:border-tv-accent"
                  placeholder="https://example.com/stream.m3u8"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category" className="text-gray-300">الفئة</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="bg-tv-dark text-white border-gray-600 focus:border-tv-accent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sports">رياضية</SelectItem>
                    <SelectItem value="algerian">جزائرية</SelectItem>
                    <SelectItem value="news">إخبارية</SelectItem>
                    <SelectItem value="kids">أطفال</SelectItem>
                    <SelectItem value="entertainment">ترفيه</SelectItem>
                    <SelectItem value="religious">دينية</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-300">وصف القناة</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-tv-dark text-white border-gray-600 focus:border-tv-accent"
                  placeholder="وصف مختصر للقناة"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="bg-tv-accent hover:bg-green-600 text-white flex-1"
                  disabled={createChannelMutation.isPending || updateChannelMutation.isPending}
                >
                  <Save className="w-4 h-4 ml-2" />
                  {editingChannel ? "تحديث القناة" : "حفظ القناة"}
                </Button>
                {editingChannel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingChannel(null);
                      resetForm();
                    }}
                  >
                    إلغاء
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Channel Management */}
        <Card className="bg-tv-surface border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Edit className="w-5 h-5 text-tv-accent" />
              إدارة القنوات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {channels.map((channel) => (
                <div key={channel.id} className="bg-tv-dark rounded-lg p-3 flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{channel.name}</h4>
                    <p className="text-sm text-gray-400">
                      {channel.category} • {channel.isActive ? "نشطة" : "غير نشطة"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(channel)}
                      className="text-tv-secondary hover:text-blue-400"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(channel.id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
