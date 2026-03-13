import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Eye, EyeOff, Save } from "lucide-react";

interface TrackingPixel {
  id: number;
  page_slug: string;
  pixel_type: string;
  pixel_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const PAGE_OPTIONS = [
  { value: "home", label: "Главная" },
  { value: "iishnitsa", label: "ИИшница (кейс)" },
  { value: "event", label: "Страница ивента" },
  { value: "all", label: "Все страницы" },
];

const PIXEL_TYPES = [
  { value: "facebook", label: "Facebook / Meta Pixel" },
  { value: "tiktok", label: "TikTok Pixel" },
  { value: "google", label: "Google Tag (gtag)" },
];

export function TrackingPixelsManager() {
  const { toast } = useToast();
  const [pixels, setPixels] = useState<TrackingPixel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [pageSlug, setPageSlug] = useState("home");
  const [pixelType, setPixelType] = useState("facebook");
  const [pixelId, setPixelId] = useState("");

  useEffect(() => {
    fetchPixels();
  }, []);

  const fetchPixels = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("tracking_pixels")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching pixels:", error);
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    } else {
      setPixels(data || []);
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!pixelId.trim()) {
      toast({ title: "Ошибка", description: "Введите Pixel ID", variant: "destructive" });
      return;
    }

    setSaving(true);
    const { error } = await (supabase as any)
      .from("tracking_pixels")
      .upsert(
        {
          page_slug: pageSlug,
          pixel_type: pixelType,
          pixel_id: pixelId.trim(),
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "page_slug,pixel_type" }
      );

    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Готово", description: "Пиксель добавлен" });
      setPixelId("");
      fetchPixels();
    }
    setSaving(false);
  };

  const handleToggle = async (pixel: TrackingPixel) => {
    const { error } = await (supabase as any)
      .from("tracking_pixels")
      .update({ is_active: !pixel.is_active, updated_at: new Date().toISOString() })
      .eq("id", pixel.id);

    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    } else {
      fetchPixels();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить пиксель?")) return;

    const { error } = await (supabase as any)
      .from("tracking_pixels")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Удалено" });
      fetchPixels();
    }
  };

  const getPageLabel = (slug: string) =>
    PAGE_OPTIONS.find((p) => p.value === slug)?.label || slug;

  const getPixelTypeLabel = (type: string) =>
    PIXEL_TYPES.find((t) => t.value === type)?.label || type;

  return (
    <div className="space-y-6">
      {/* Add pixel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Добавить пиксель
          </CardTitle>
          <CardDescription>
            Facebook/Meta, TikTok или Google пиксель для отслеживания конверсий
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <Label>Страница</Label>
              <Select value={pageSlug} onValueChange={setPageSlug}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Тип пикселя</Label>
              <Select value={pixelType} onValueChange={setPixelType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PIXEL_TYPES.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Pixel ID</Label>
              <Input
                value={pixelId}
                onChange={(e) => setPixelId(e.target.value)}
                placeholder="1232145425143152"
              />
            </div>
          </div>

          <Button onClick={handleAdd} disabled={saving || !pixelId.trim()}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Сохранение..." : "Добавить"}
          </Button>
        </CardContent>
      </Card>

      {/* Pixels list */}
      <Card>
        <CardHeader>
          <CardTitle>Активные пиксели</CardTitle>
          <CardDescription>
            {pixels.length === 0
              ? "Нет пикселей. Добавьте первый выше."
              : `${pixels.length} пиксел${pixels.length === 1 ? "ь" : "ей"}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="space-y-3">
              {pixels.map((pixel) => (
                <div
                  key={pixel.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-white"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggle(pixel)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      title={pixel.is_active ? "Выключить" : "Включить"}
                    >
                      {pixel.is_active ? (
                        <Eye className="h-5 w-5 text-green-600" />
                      ) : (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{getPageLabel(pixel.page_slug)}</span>
                        <Badge variant={pixel.is_active ? "default" : "secondary"}>
                          {getPixelTypeLabel(pixel.pixel_type)}
                        </Badge>
                      </div>
                      <code className="text-sm text-muted-foreground">{pixel.pixel_id}</code>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(pixel.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
