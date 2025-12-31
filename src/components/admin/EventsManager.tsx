import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExternalLink, Copy, Link, Bell, MoreHorizontal, Pencil, Trash2, Calendar, MapPin, Plus } from "lucide-react";
import EventEditor from "./EventEditor";

interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  duration_minutes: number;
  speaker: string | null;
  price: number;
  registration_info: string | null;
  location_name: string | null;
  location_address: string | null;
  yandex_map_url: string | null;
  telegram_bot_url: string | null;
  is_published: boolean;
  slug: string | null;
  created_at: string;
  updated_at: string;
}

const EventsManager: React.FC = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: false });

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

  const openAddEvent = () => {
    setEditingEvent(null);
    setEditorOpen(true);
  };

  const openEditEvent = (event: Event) => {
    setEditingEvent(event);
    setEditorOpen(true);
  };

  const handleEditorClose = () => {
    setEditorOpen(false);
    setEditingEvent(null);
  };

  const handleEditorSave = () => {
    setEditorOpen(false);
    setEditingEvent(null);
    fetchEvents();
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm("Вы уверены, что хотите удалить это мероприятие?")) {
      return;
    }

    try {
      // Delete from bot_events first (foreign key constraint)
      await supabase.from("bot_events").delete().eq("web_event_id", eventId);

      // Delete event speakers
      await supabase.from("event_speakers").delete().eq("event_id", eventId);

      // Delete the event
      const { error } = await supabase.from("events").delete().eq("id", eventId);
      if (error) throw error;

      toast({
        title: "Удалено",
        description: "Мероприятие удалено из сайта и бота",
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

  const getEventUrl = (event: Event) => {
    const baseUrl = window.location.origin;
    const slug = event.slug || event.id;
    return `${baseUrl}/event/${slug}`;
  };

  const copyEventLink = async (event: Event) => {
    const url = getEventUrl(event);
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Скопировано!",
        description: "Ссылка на мероприятие скопирована в буфер обмена",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось скопировать ссылку",
        variant: "destructive",
      });
    }
  };

  const openEventPage = (event: Event) => {
    const url = getEventUrl(event);
    window.open(url, "_blank");
  };

  const handleNotify = async (event: Event) => {
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });

    const message = `<b>${event.title}</b>\n\n` +
      `${event.description ? event.description.slice(0, 200) + "..." : ""}\n\n` +
      `${event.location_name ? `${event.location_name}` : ""}\n` +
      `${formattedDate}\n\n` +
      `${event.price > 0 ? `${event.price} BYN` : "Бесплатно"}`;

    try {
      const { error } = await supabase
        .from("broadcast_queue")
        .insert([{
          title: `${event.title}`,
          message_text: message,
          message_type: "event_notification",
          target_type: "all",
          target_event_id: event.id,
          status: "pending",
        }]);

      if (error) throw error;

      toast({
        title: "Оповещение создано",
        description: "Рассылка будет отправлена при следующей синхронизации (до 60 сек)",
      });
    } catch (error) {
      console.error("Error creating notification:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать оповещение",
        variant: "destructive",
      });
    }
  };

  // Show editor if open
  if (editorOpen) {
    return (
      <EventEditor
        event={editingEvent}
        onClose={handleEditorClose}
        onSave={handleEditorSave}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Управление мероприятиями</h2>
        <Button onClick={openAddEvent}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить мероприятие
        </Button>
      </div>

      {loading ? (
        <p>Загрузка...</p>
      ) : events.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          Нет мероприятий. Создайте новое!
        </p>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Название</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Место</TableHead>
                <TableHead>Цена</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id} className={!event.is_published ? "opacity-60" : ""}>
                  <TableCell>
                    <div className="font-medium">{event.title}</div>
                    {event.is_published && (
                      <div className="flex items-center gap-1 mt-1">
                        <Link className="h-3 w-3 text-muted-foreground" />
                        <button
                          onClick={() => copyEventLink(event)}
                          className="text-xs text-muted-foreground hover:text-primary truncate max-w-[200px]"
                          title={getEventUrl(event)}
                        >
                          {event.slug || event.id.slice(0, 8)}
                        </button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm">{new Date(event.date).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}</div>
                        <div className="text-xs text-muted-foreground">{new Date(event.date).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {event.location_name ? (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="truncate max-w-[150px]" title={event.location_name}>
                          {event.location_name}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={event.price > 0 ? "font-medium" : "text-green-600"}>
                      {event.price > 0 ? `${event.price} BYN` : "Бесплатно"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={event.is_published ? "default" : "secondary"}>
                      {event.is_published ? "Опубликовано" : "Черновик"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditEvent(event)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Редактировать
                        </DropdownMenuItem>
                        {event.is_published && (
                          <>
                            <DropdownMenuItem onClick={() => openEventPage(event)}>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Открыть страницу
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => copyEventLink(event)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Копировать ссылку
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleNotify(event)}>
                              <Bell className="h-4 w-4 mr-2" />
                              Оповестить
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(event.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default EventsManager;
