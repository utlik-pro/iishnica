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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  duration_minutes: number;
  speaker: string | null;
  price: number;
  registration_info: string | null;
  created_at: string;
  updated_at: string;
}

const EventsManager: React.FC = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);

  // Форма для нового/редактируемого события
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "10:00",
    duration_minutes: 120,
    speaker: "",
    price: 25,
    registration_info: "",
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить мероприятия",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openAddEventDialog = () => {
    setCurrentEvent(null);
    setForm({
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      time: "10:00",
      duration_minutes: 120,
      speaker: "",
      price: 25,
      registration_info: "",
    });
    setOpenDialog(true);
  };

  const openEditEventDialog = (event: Event) => {
    const eventDate = new Date(event.date);
    setCurrentEvent(event);
    setForm({
      title: event.title,
      description: event.description || "",
      date: eventDate.toISOString().split("T")[0],
      time: eventDate.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }),
      duration_minutes: event.duration_minutes,
      speaker: event.speaker || "",
      price: event.price,
      registration_info: event.registration_info || "",
    });
    setOpenDialog(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "price" || name === "duration_minutes" ? parseFloat(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Создаем дату в локальном часовом поясе
      const [hours, minutes] = form.time.split(':').map(Number);
      const date = new Date(form.date);
      date.setHours(hours, minutes, 0, 0);
      
      const eventData = {
        title: form.title,
        description: form.description,
        date: date.toISOString(),
        duration_minutes: form.duration_minutes,
        speaker: form.speaker,
        price: form.price,
        registration_info: form.registration_info,
        updated_at: new Date().toISOString(),
      };

      let result;

      if (currentEvent) {
        // Обновляем существующее событие
        result = await supabase
          .from("events")
          .update(eventData)
          .eq("id", currentEvent.id);
      } else {
        // Создаем новое событие
        result = await supabase
          .from("events")
          .insert([eventData]);
      }

      if (result.error) throw result.error;

      toast({
        title: currentEvent ? "Обновлено" : "Создано",
        description: `Мероприятие успешно ${currentEvent ? "обновлено" : "создано"}`,
      });

      setOpenDialog(false);
      fetchEvents();

    } catch (error) {
      console.error("Error saving event:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить мероприятие",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm("Вы уверены, что хотите удалить это мероприятие?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);

      if (error) throw error;

      toast({
        title: "Удалено",
        description: "Мероприятие успешно удалено",
      });

      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить мероприятие",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Управление завтраками</h2>
        <Button onClick={openAddEventDialog}>Добавить завтрак</Button>
      </div>

      {loading ? (
        <p>Загрузка...</p>
      ) : events.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Нет мероприятий. Создайте новое!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <CardTitle className="line-clamp-2">{event.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-sm font-medium">Дата и время:</p>
                  <p>{formatDate(event.date)}</p>
                </div>
                
                {event.speaker && (
                  <div>
                    <p className="text-sm font-medium">Спикер:</p>
                    <p>{event.speaker}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm font-medium">Стоимость:</p>
                  <p>{event.price} BYN</p>
                </div>
                
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => openEditEventDialog(event)}>
                    Редактировать
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(event.id)}>
                    Удалить
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {currentEvent ? "Редактировать завтрак" : "Создать завтрак"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название</Label>
              <Input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Дата</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Время</Label>
                <Input
                  id="time"
                  name="time"
                  type="time"
                  value={form.time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration_minutes">Длительность (мин)</Label>
                <Input
                  id="duration_minutes"
                  name="duration_minutes"
                  type="number"
                  value={form.duration_minutes}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Цена (BYN)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="speaker">Спикер</Label>
              <Input
                id="speaker"
                name="speaker"
                value={form.speaker}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="registration_info">Информация о регистрации</Label>
              <Textarea
                id="registration_info"
                name="registration_info"
                value={form.registration_info}
                onChange={handleChange}
                rows={2}
              />
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

export default EventsManager;
