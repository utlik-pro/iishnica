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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, User, Trash2, Edit, Plus, ArrowUp, ArrowDown } from "lucide-react";

interface Event {
  id: string;
  title: string;
  date: string;
}

interface Speaker {
  id: string;
  name: string;
  title: string | null;
}

interface ProgramItem {
  id: string;
  event_id: string;
  time_start: string;
  time_end: string;
  title: string;
  description: string | null;
  type: string;
  speaker_id: string | null;
  order_index: number;
  created_at: string;
  speaker?: Speaker | null;
}

const PROGRAM_TYPES = [
  { value: "registration", label: "Регистрация" },
  { value: "talk", label: "Доклад" },
  { value: "workshop", label: "Воркшоп" },
  { value: "networking", label: "Нетворкинг" },
  { value: "break", label: "Перерыв" },
  { value: "lunch", label: "Обед" },
  { value: "coffee", label: "Кофе-брейк" },
  { value: "qa", label: "Q&A сессия" },
  { value: "other", label: "Другое" },
];

const EventProgramManager: React.FC = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [programItems, setProgramItems] = useState<ProgramItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState<ProgramItem | null>(null);

  const [form, setForm] = useState({
    time_start: "09:00",
    time_end: "09:30",
    title: "",
    description: "",
    type: "talk",
    speaker_id: "",
  });

  useEffect(() => {
    fetchEvents();
    fetchSpeakers();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchProgramItems();
    } else {
      setProgramItems([]);
    }
  }, [selectedEventId]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, date")
        .order("date", { ascending: false });

      if (error) throw error;
      setEvents(data || []);

      // Auto-select first event if available
      if (data && data.length > 0 && !selectedEventId) {
        setSelectedEventId(data[0].id);
      }
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

  const fetchSpeakers = async () => {
    try {
      const { data, error } = await supabase
        .from("speakers")
        .select("id, name, title")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setSpeakers(data || []);
    } catch (error) {
      console.error("Error fetching speakers:", error);
    }
  };

  const fetchProgramItems = async () => {
    if (!selectedEventId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("event_program")
        .select(`
          id, event_id, time_start, time_end, title, description,
          type, speaker_id, order_index, created_at,
          speaker:speakers (id, name, title)
        `)
        .eq("event_id", selectedEventId)
        .order("order_index");

      if (error) throw error;

      // Transform the data to match our interface
      const items = (data || []).map(item => ({
        ...item,
        speaker: item.speaker as Speaker | null
      }));

      setProgramItems(items);
    } catch (error) {
      console.error("Error fetching program items:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить программу",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openAddDialog = () => {
    setCurrentItem(null);
    const maxOrder = programItems.length > 0
      ? Math.max(...programItems.map(p => p.order_index)) + 1
      : 0;
    setForm({
      time_start: "09:00",
      time_end: "09:30",
      title: "",
      description: "",
      type: "talk",
      speaker_id: "",
    });
    setOpenDialog(true);
  };

  const openEditDialog = (item: ProgramItem) => {
    setCurrentItem(item);
    setForm({
      time_start: item.time_start,
      time_end: item.time_end,
      title: item.title,
      description: item.description || "",
      type: item.type,
      speaker_id: item.speaker_id || "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEventId) {
      toast({
        title: "Ошибка",
        description: "Выберите мероприятие",
        variant: "destructive",
      });
      return;
    }

    try {
      const itemData = {
        event_id: selectedEventId,
        time_start: form.time_start,
        time_end: form.time_end,
        title: form.title,
        description: form.description || null,
        type: form.type,
        speaker_id: form.speaker_id || null,
        order_index: currentItem?.order_index ?? programItems.length,
      };

      let result;

      if (currentItem) {
        result = await supabase
          .from("event_program")
          .update(itemData)
          .eq("id", currentItem.id);
      } else {
        result = await supabase
          .from("event_program")
          .insert([itemData]);
      }

      if (result.error) throw result.error;

      toast({
        title: currentItem ? "Обновлено" : "Создано",
        description: `Пункт программы успешно ${currentItem ? "обновлен" : "создан"}`,
      });

      setOpenDialog(false);
      fetchProgramItems();

    } catch (error) {
      console.error("Error saving program item:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить пункт программы",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот пункт программы?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("event_program")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      toast({
        title: "Удалено",
        description: "Пункт программы успешно удален",
      });

      fetchProgramItems();
    } catch (error) {
      console.error("Error deleting program item:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить пункт программы",
        variant: "destructive",
      });
    }
  };

  const moveItem = async (item: ProgramItem, direction: "up" | "down") => {
    const currentIndex = programItems.findIndex(p => p.id === item.id);
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= programItems.length) return;

    const otherItem = programItems[newIndex];

    try {
      // Swap order_index values
      await Promise.all([
        supabase
          .from("event_program")
          .update({ order_index: otherItem.order_index })
          .eq("id", item.id),
        supabase
          .from("event_program")
          .update({ order_index: item.order_index })
          .eq("id", otherItem.id),
      ]);

      fetchProgramItems();
    } catch (error) {
      console.error("Error reordering:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось изменить порядок",
        variant: "destructive",
      });
    }
  };

  const getTypeLabel = (type: string) => {
    return PROGRAM_TYPES.find(t => t.value === type)?.label || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      registration: "bg-blue-100 text-blue-800",
      talk: "bg-purple-100 text-purple-800",
      workshop: "bg-green-100 text-green-800",
      networking: "bg-yellow-100 text-yellow-800",
      break: "bg-gray-100 text-gray-800",
      lunch: "bg-orange-100 text-orange-800",
      coffee: "bg-amber-100 text-amber-800",
      qa: "bg-pink-100 text-pink-800",
      other: "bg-slate-100 text-slate-800",
    };
    return colors[type] || colors.other;
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Управление программой</h2>
      </div>

      <div className="mb-6">
        <Label htmlFor="event-select">Выберите мероприятие</Label>
        <Select value={selectedEventId} onValueChange={setSelectedEventId}>
          <SelectTrigger className="w-full max-w-md mt-2">
            <SelectValue placeholder="Выберите мероприятие" />
          </SelectTrigger>
          <SelectContent>
            {events.map((event) => (
              <SelectItem key={event.id} value={event.id}>
                {event.title} ({new Date(event.date).toLocaleDateString("ru-RU")})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedEventId && (
        <div className="mb-4">
          <Button onClick={openAddDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Добавить пункт программы
          </Button>
        </div>
      )}

      {loading ? (
        <p>Загрузка...</p>
      ) : !selectedEventId ? (
        <p className="text-center text-muted-foreground py-8">
          Выберите мероприятие для просмотра программы
        </p>
      ) : programItems.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          Программа пуста. Добавьте первый пункт!
        </p>
      ) : (
        <div className="space-y-3">
          {programItems.map((item, index) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveItem(item, "up")}
                      disabled={index === 0}
                      className="h-6 w-6 p-0"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveItem(item, "down")}
                      disabled={index === programItems.length - 1}
                      className="h-6 w-6 p-0"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatTime(item.time_start)} - {formatTime(item.time_end)}
                      </div>
                      <span className={`px-2 py-0.5 text-xs rounded ${getTypeColor(item.type)}`}>
                        {getTypeLabel(item.type)}
                      </span>
                    </div>

                    <h4 className="font-semibold mb-1">{item.title}</h4>

                    {item.description && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    {item.speaker && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="w-4 h-4 mr-1" />
                        {item.speaker.name}
                        {item.speaker.title && ` - ${item.speaker.title}`}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(item)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {currentItem ? "Редактировать пункт" : "Добавить пункт программы"}
            </DialogTitle>
          </DialogHeader>

          <DialogDescription>
            {currentItem
              ? "Редактируйте информацию о пункте программы."
              : "Добавьте новый пункт в программу мероприятия."}
          </DialogDescription>

          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="time_start">Начало</Label>
                <Input
                  id="time_start"
                  name="time_start"
                  type="time"
                  value={form.time_start}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time_end">Окончание</Label>
                <Input
                  id="time_end"
                  name="time_end"
                  type="time"
                  value={form.time_end}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Тип</Label>
              <Select value={form.type} onValueChange={(val) => setForm({ ...form, type: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent>
                  {PROGRAM_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Название</Label>
              <Input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Название пункта программы"
                required
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
                placeholder="Краткое описание..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="speaker_id">Спикер (опционально)</Label>
              <Select
                value={form.speaker_id}
                onValueChange={(val) => setForm({ ...form, speaker_id: val === "none" ? "" : val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите спикера" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Без спикера</SelectItem>
                  {speakers.map((speaker) => (
                    <SelectItem key={speaker.id} value={speaker.id}>
                      {speaker.name} {speaker.title && `(${speaker.title})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

export default EventProgramManager;
