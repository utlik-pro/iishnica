import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import ImageUpload from "@/components/ui/image-upload";

interface Speaker {
  id: string;
  name: string;
  title: string | null;
  description: string | null;
  photo_url: string | null;
  social_url: string | null;
  is_active: boolean;
  is_author: boolean;
  created_at: string;
  updated_at: string;
}

const SpeakersManager: React.FC = () => {
  const { toast } = useToast();
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<Speaker | null>(null);

  const [form, setForm] = useState({
    name: "",
    title: "",
    description: "",
    photo_url: "",
    social_url: "",
    is_active: true,
    is_author: false,
  });

  useEffect(() => {
    fetchSpeakers();
  }, []);

  const fetchSpeakers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("speakers")
        .select("*")
        .order("name");

      if (error) throw error;
      setSpeakers(data || []);
    } catch (error) {
      console.error("Error fetching speakers:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить спикеров",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openAddSpeakerDialog = () => {
    setCurrentSpeaker(null);
    setForm({
      name: "",
      title: "",
      description: "",
      photo_url: "",
      social_url: "",
      is_active: true,
      is_author: false,
    });
    setOpenDialog(true);
  };

  const openEditSpeakerDialog = (speaker: Speaker) => {
    setCurrentSpeaker(speaker);
    setForm({
      name: speaker.name,
      title: speaker.title || "",
      description: speaker.description || "",
      photo_url: speaker.photo_url || "",
      social_url: speaker.social_url || "",
      is_active: speaker.is_active,
      is_author: speaker.is_author,
    });
    setOpenDialog(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSwitchChange = (field: "is_active" | "is_author", checked: boolean) => {
    setForm({
      ...form,
      [field]: checked,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const speakerData = {
        name: form.name,
        title: form.title || null,
        description: form.description || null,
        photo_url: form.photo_url || null,
        social_url: form.social_url || null,
        is_active: form.is_active,
        is_author: form.is_author,
        updated_at: new Date().toISOString(),
      };

      let result;

      if (currentSpeaker) {
        result = await supabase
          .from("speakers")
          .update(speakerData)
          .eq("id", currentSpeaker.id);
      } else {
        result = await supabase
          .from("speakers")
          .insert([speakerData]);
      }

      if (result.error) throw result.error;

      toast({
        title: currentSpeaker ? "Обновлено" : "Создано",
        description: `Спикер успешно ${currentSpeaker ? "обновлен" : "создан"}`,
      });

      setOpenDialog(false);
      fetchSpeakers();

    } catch (error) {
      console.error("Error saving speaker:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить спикера",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (speakerId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этого спикера?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("speakers")
        .delete()
        .eq("id", speakerId);

      if (error) throw error;

      toast({
        title: "Удалено",
        description: "Спикер успешно удален",
      });

      fetchSpeakers();
    } catch (error) {
      console.error("Error deleting speaker:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить спикера",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Управление спикерами</h2>
        <Button onClick={openAddSpeakerDialog}>Добавить спикера</Button>
      </div>

      {loading ? (
        <p>Загрузка...</p>
      ) : speakers.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Нет спикеров. Создайте нового!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {speakers.map((speaker) => (
            <Card key={speaker.id} className={`overflow-hidden ${!speaker.is_active ? "opacity-60" : ""}`}>
              <CardHeader className="bg-muted/50">
                <CardTitle className="line-clamp-2">{speaker.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {speaker.photo_url && (
                  <div className="h-32 flex items-center justify-center border rounded p-2 bg-white">
                    <img
                      src={speaker.photo_url}
                      alt={speaker.name}
                      className="max-h-full max-w-full object-cover rounded"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  {speaker.title && (
                    <div>
                      <p className="text-sm font-medium">Должность:</p>
                      <p className="text-sm text-muted-foreground">{speaker.title}</p>
                    </div>
                  )}

                  {speaker.description && (
                    <div>
                      <p className="text-sm font-medium">Описание:</p>
                      <p className="text-sm text-muted-foreground line-clamp-3">{speaker.description}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Статус:</p>
                    <div className="flex gap-1">
                      {speaker.is_author && (
                        <span className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-800">
                          Автор
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs rounded ${speaker.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                        {speaker.is_active ? "Активный" : "Неактивный"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => openEditSpeakerDialog(speaker)}>
                    Редактировать
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(speaker.id)}>
                    Удалить
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentSpeaker ? "Редактировать спикера" : "Добавить спикера"}
            </DialogTitle>
          </DialogHeader>

          <DialogDescription>
            {currentSpeaker
              ? "Редактируйте информацию о существующем спикере."
              : "Добавьте нового спикера, заполнив форму ниже."}
          </DialogDescription>

          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Имя</Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Должность</Label>
              <Input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="CEO, CTO, Разработчик..."
              />
            </div>

            <ImageUpload
              value={form.photo_url}
              onChange={(url) => setForm({ ...form, photo_url: url })}
              folder="speakers"
              label="Фотография"
              compact
            />

            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Краткая биография или описание спикера..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="social_url">Ссылка на соц. сеть</Label>
              <Input
                id="social_url"
                name="social_url"
                value={form.social_url}
                onChange={handleChange}
                placeholder="https://t.me/username"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={form.is_active}
                onCheckedChange={(checked) => handleSwitchChange("is_active", checked)}
              />
              <Label htmlFor="is_active">Активный</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_author"
                checked={form.is_author}
                onCheckedChange={(checked) => handleSwitchChange("is_author", checked)}
              />
              <Label htmlFor="is_author">Автор публикаций</Label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                Отмена
              </Button>
              <Button type="submit">Сохранить</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SpeakersManager;
