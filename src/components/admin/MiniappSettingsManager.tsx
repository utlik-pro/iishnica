import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Save, Copy, Check } from "lucide-react";

interface MiniappConfig {
  id?: string;
  miniapp_url: string;
  welcome_text: string;
  success_message: string;
  form_title: string;
  form_description: string;
  button_text: string;
  supabase_url: string;
  supabase_anon_key: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

const DEFAULT_CONFIG: MiniappConfig = {
  miniapp_url: "https://t.me/your_bot/miniapp",
  welcome_text: "Добро пожаловать в ИИшницу! Зарегистрируйтесь на мероприятие.",
  success_message: "Спасибо за регистрацию! Мы свяжемся с вами в ближайшее время.",
  form_title: "Регистрация на мероприятие",
  form_description: "Заполните форму, чтобы присоединиться к нашему сообществу",
  button_text: "Зарегистрироваться",
  supabase_url: "https://ndpkxustvcijykzxqxrn.supabase.co",
  supabase_anon_key: "",
  is_active: true,
};

export function MiniappSettingsManager() {
  const { toast } = useToast();
  const [config, setConfig] = useState<MiniappConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("miniapp_config")
        .select("*")
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setConfig(data as MiniappConfig);
      }
    } catch (error) {
      console.error("Error fetching miniapp config:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from("miniapp_config")
        .select("id")
        .single();

      if (existing) {
        const { error } = await supabase
          .from("miniapp_config")
          .update({
            ...config,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("miniapp_config")
          .insert([config]);

        if (error) throw error;
      }

      toast({
        title: "Сохранено",
        description: "Настройки miniapp успешно обновлены",
      });

      fetchConfig();
    } catch (error) {
      console.error("Error saving miniapp config:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить настройки",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast({
      title: "Скопировано",
      description: "Значение скопировано в буфер обмена",
    });
  };

  if (loading) {
    return <div className="p-4">Загрузка настроек...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Настройки Telegram Mini-App</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Конфигурация miniapp для регистрации на мероприятия
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Сохранение..." : "Сохранить"}
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Основные настройки</CardTitle>
            <CardDescription>URL и текстовое содержимое miniapp</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="miniapp_url">URL Mini-App</Label>
              <div className="flex gap-2">
                <Input
                  id="miniapp_url"
                  value={config.miniapp_url}
                  onChange={(e) => setConfig({ ...config, miniapp_url: e.target.value })}
                  placeholder="https://t.me/your_bot/miniapp"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(config.miniapp_url, "url")}
                >
                  {copiedField === "url" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="welcome_text">Приветственный текст</Label>
              <Textarea
                id="welcome_text"
                value={config.welcome_text}
                onChange={(e) => setConfig({ ...config, welcome_text: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="success_message">Сообщение об успехе</Label>
              <Textarea
                id="success_message"
                value={config.success_message}
                onChange={(e) => setConfig({ ...config, success_message: e.target.value })}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Форма регистрации</CardTitle>
            <CardDescription>Тексты для формы регистрации в miniapp</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="form_title">Заголовок формы</Label>
              <Input
                id="form_title"
                value={config.form_title}
                onChange={(e) => setConfig({ ...config, form_title: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="form_description">Описание формы</Label>
              <Textarea
                id="form_description"
                value={config.form_description}
                onChange={(e) => setConfig({ ...config, form_description: e.target.value })}
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="button_text">Текст кнопки</Label>
              <Input
                id="button_text"
                value={config.button_text}
                onChange={(e) => setConfig({ ...config, button_text: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Подключение к Supabase</CardTitle>
            <CardDescription>API ключи для интеграции с базой данных</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="supabase_url">Supabase URL</Label>
              <div className="flex gap-2">
                <Input
                  id="supabase_url"
                  value={config.supabase_url}
                  onChange={(e) => setConfig({ ...config, supabase_url: e.target.value })}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(config.supabase_url, "supabase_url")}
                >
                  {copiedField === "supabase_url" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="supabase_anon_key">Supabase Anon Key</Label>
              <div className="flex gap-2">
                <Input
                  id="supabase_anon_key"
                  type="password"
                  value={config.supabase_anon_key}
                  onChange={(e) => setConfig({ ...config, supabase_anon_key: e.target.value })}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(config.supabase_anon_key, "anon_key")}
                >
                  {copiedField === "anon_key" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Используйте анонимный (public) ключ для miniapp
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Инструкция для miniapp</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2 text-yellow-900">
            <p><strong>1.</strong> Используйте эти настройки в коде miniapp</p>
            <p><strong>2.</strong> При отправке регистрации установите <code className="bg-yellow-100 px-1 rounded">source: 'telegram_miniapp'</code></p>
            <p><strong>3.</strong> Отправляйте данные в таблицу <code className="bg-yellow-100 px-1 rounded">leads</code> с привязкой к событию</p>
            <pre className="bg-yellow-100 p-2 rounded mt-2 overflow-x-auto">
{`await supabase.from("leads").insert({
  name: "Имя пользователя",
  phone: "+375XXXXXXXXX",
  ticket_code: "MAIN-XXXXX-XXXX",
  event_id: "<UUID события>",
  source: "telegram_miniapp"
})`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
