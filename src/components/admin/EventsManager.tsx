import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExternalLink, Copy, Link, Bell, MoreHorizontal, Pencil, Trash2, Calendar, MapPin } from "lucide-react";

interface Location {
  id: string;
  name: string;
  address: string | null;
  photo_url: string | null;
  yandex_map_url: string | null;
  is_active: boolean;
}

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

interface Speaker {
  id: string;
  name: string;
  title: string | null;
  photo_url: string | null;
  is_active: boolean;
}

interface EventSpeaker {
  speaker_id: string;
  talk_title: string;
  talk_description: string;
  order_index: number;
}

const EventsManager: React.FC = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "18:00",
    duration_minutes: 120,
    price: 0,
    registration_info: "",
    location_name: "",
    location_address: "",
    yandex_map_url: "",
    telegram_bot_url: "https://t.me/maincomby_bot",
    is_published: false,
    slug: "",
  });

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[а-яё]/g, (char) => {
        const map: { [key: string]: string } = {
          'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
          'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
          'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
          'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
          'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
        };
        return map[char] || char;
      })
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50);
  };

  const [selectedSpeakers, setSelectedSpeakers] = useState<EventSpeaker[]>([]);

  useEffect(() => {
    fetchEvents();
    fetchSpeakers();
    fetchLocations();
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

  const fetchSpeakers = async () => {
    try {
      const { data, error } = await supabase
        .from("speakers")
        .select("id, name, title, photo_url, is_active")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setSpeakers(data || []);
    } catch (error) {
      console.error("Error fetching speakers:", error);
    }
  };

  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase
        .from("locations")
        .select("id, name, address, photo_url, yandex_map_url, is_active")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const handleLocationSelect = (locationId: string) => {
    setSelectedLocationId(locationId);
    if (locationId === "custom") {
      // Keep existing values for custom input
      return;
    }
    const location = locations.find((l) => l.id === locationId);
    if (location) {
      setForm({
        ...form,
        location_name: location.name,
        location_address: location.address || "",
        yandex_map_url: location.yandex_map_url || "",
      });
    }
  };

  const fetchEventSpeakers = async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from("event_speakers")
        .select("speaker_id, talk_title, talk_description, order_index")
        .eq("event_id", eventId)
        .order("order_index");

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching event speakers:", error);
      return [];
    }
  };

  const openAddEventDialog = () => {
    setCurrentEvent(null);
    setForm({
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      time: "18:00",
      duration_minutes: 120,
      price: 0,
      registration_info: "",
      location_name: "",
      location_address: "",
      yandex_map_url: "",
      telegram_bot_url: "https://t.me/maincomby_bot",
      is_published: false,
      slug: "",
    });
    setSelectedSpeakers([]);
    setSelectedLocationId("");
    setOpenDialog(true);
  };

  const openEditEventDialog = async (event: Event) => {
    const eventDate = new Date(event.date);
    setCurrentEvent(event);
    setForm({
      title: event.title,
      description: event.description || "",
      date: eventDate.toISOString().split("T")[0],
      time: eventDate.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      duration_minutes: event.duration_minutes,
      price: event.price,
      registration_info: event.registration_info || "",
      location_name: event.location_name || "",
      location_address: event.location_address || "",
      yandex_map_url: event.yandex_map_url || "",
      telegram_bot_url: event.telegram_bot_url || "https://t.me/maincomby_bot",
      is_published: event.is_published,
      slug: event.slug || "",
    });

    // Try to find matching location
    const matchingLocation = locations.find(
      (l) => l.name === event.location_name && l.address === event.location_address
    );
    setSelectedLocationId(matchingLocation?.id || "custom");

    const eventSpeakers = await fetchEventSpeakers(event.id);
    setSelectedSpeakers(
      eventSpeakers.map((es) => ({
        speaker_id: es.speaker_id,
        talk_title: es.talk_title || "",
        talk_description: es.talk_description || "",
        order_index: es.order_index,
      }))
    );
    setOpenDialog(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]:
        name === "price" || name === "duration_minutes"
          ? parseFloat(value) || 0
          : value,
    });
  };

  const handleSwitchChange = (checked: boolean) => {
    setForm({
      ...form,
      is_published: checked,
    });
  };

  const handleSpeakerToggle = (speakerId: string, checked: boolean) => {
    if (checked) {
      setSelectedSpeakers([
        ...selectedSpeakers,
        {
          speaker_id: speakerId,
          talk_title: "",
          talk_description: "",
          order_index: selectedSpeakers.length,
        },
      ]);
    } else {
      setSelectedSpeakers(
        selectedSpeakers.filter((s) => s.speaker_id !== speakerId)
      );
    }
  };

  const handleSpeakerDetailChange = (
    speakerId: string,
    field: "talk_title" | "talk_description",
    value: string
  ) => {
    setSelectedSpeakers(
      selectedSpeakers.map((s) =>
        s.speaker_id === speakerId ? { ...s, [field]: value } : s
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const [hours, minutes] = form.time.split(":").map(Number);
      const date = new Date(form.date);
      date.setHours(hours, minutes, 0, 0);

      const eventData = {
        title: form.title,
        description: form.description || null,
        date: date.toISOString(),
        duration_minutes: form.duration_minutes,
        price: form.price,
        registration_info: form.registration_info || null,
        location_name: form.location_name || null,
        location_address: form.location_address || null,
        yandex_map_url: form.yandex_map_url || null,
        telegram_bot_url: form.telegram_bot_url || null,
        is_published: form.is_published,
        slug: form.slug || generateSlug(form.title),
        updated_at: new Date().toISOString(),
      };

      let eventId: string;

      if (currentEvent) {
        const { error } = await supabase
          .from("events")
          .update(eventData)
          .eq("id", currentEvent.id);
        if (error) throw error;
        eventId = currentEvent.id;
      } else {
        const { data, error } = await supabase
          .from("events")
          .insert([eventData])
          .select("id")
          .single();
        if (error) throw error;
        eventId = data.id;
      }

      // Update event speakers
      await supabase.from("event_speakers").delete().eq("event_id", eventId);

      if (selectedSpeakers.length > 0) {
        const speakerInserts = selectedSpeakers.map((s, index) => ({
          event_id: eventId,
          speaker_id: s.speaker_id,
          talk_title: s.talk_title || null,
          talk_description: s.talk_description || null,
          order_index: index,
        }));

        const { error: speakerError } = await supabase
          .from("event_speakers")
          .insert(speakerInserts);
        if (speakerError) throw speakerError;
      }

      // Sync with bot_events table
      const speakerNames = selectedSpeakers
        .map((s) => {
          const speaker = speakers.find((sp) => sp.id === s.speaker_id);
          return speaker ? `${speaker.name}${s.talk_title ? `: ${s.talk_title}` : ""}` : "";
        })
        .filter(Boolean)
        .join("; ");

      const botEventData = {
        title: form.title,
        description: form.description || null,
        event_date: date.toISOString(),
        city: "Минск",
        location: form.location_name || null,
        location_url: form.yandex_map_url || null,
        speakers: speakerNames || null,
        is_active: form.is_published,
        web_event_id: eventId,
      };

      // Check if bot_event already exists for this web event
      const { data: existingBotEvent } = await supabase
        .from("bot_events")
        .select("id")
        .eq("web_event_id", eventId)
        .single();

      if (existingBotEvent) {
        await supabase
          .from("bot_events")
          .update(botEventData)
          .eq("web_event_id", eventId);
      } else {
        await supabase.from("bot_events").insert([botEventData]);
      }

      toast({
        title: currentEvent ? "Обновлено" : "Создано",
        description: `Мероприятие успешно ${currentEvent ? "обновлено" : "создано"} и синхронизировано с ботом`,
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Управление мероприятиями</h2>
        <Button onClick={openAddEventDialog}>Добавить мероприятие</Button>
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
                        <DropdownMenuItem onClick={() => openEditEventDialog(event)}>
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

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentEvent ? "Редактировать мероприятие" : "Создать мероприятие"}
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

            <div className="space-y-2">
              <Label htmlFor="slug">URL-адрес (slug)</Label>
              <div className="flex gap-2">
                <Input
                  id="slug"
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  placeholder="например: december-18"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setForm({ ...form, slug: generateSlug(form.title) })}
                >
                  Сгенерировать
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Ссылка будет: /event/{form.slug || generateSlug(form.title) || "..."}
              </p>
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
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="border-t pt-4">
              <Label className="text-base font-semibold">Локация</Label>
              <div className="space-y-2 mt-2">
                <Label>Выберите локацию</Label>
                <Select
                  value={selectedLocationId}
                  onValueChange={handleLocationSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите локацию или введите вручную" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        <div className="flex items-center gap-2">
                          {location.photo_url && (
                            <img
                              src={location.photo_url}
                              alt=""
                              className="w-6 h-6 rounded object-cover"
                            />
                          )}
                          <span>{location.name}</span>
                          {location.address && (
                            <span className="text-muted-foreground text-xs">
                              — {location.address}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">
                      Ввести вручную...
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(selectedLocationId === "custom" || selectedLocationId === "") && (
                <>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="space-y-2">
                      <Label htmlFor="location_name">Название места</Label>
                      <Input
                        id="location_name"
                        name="location_name"
                        value={form.location_name}
                        onChange={handleChange}
                        placeholder="Пространство Бетон"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location_address">Адрес</Label>
                      <Input
                        id="location_address"
                        name="location_address"
                        value={form.location_address}
                        onChange={handleChange}
                        placeholder="Минск, ул. Кальварийская, 17"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 mt-2">
                    <Label htmlFor="yandex_map_url">Ссылка на Yandex.Карты</Label>
                    <Input
                      id="yandex_map_url"
                      name="yandex_map_url"
                      value={form.yandex_map_url}
                      onChange={handleChange}
                      placeholder="https://yandex.by/maps/-/..."
                    />
                  </div>
                </>
              )}

              {selectedLocationId && selectedLocationId !== "custom" && (
                <div className="mt-3 p-3 bg-muted rounded-lg">
                  <p className="font-medium">{form.location_name}</p>
                  {form.location_address && (
                    <p className="text-sm text-muted-foreground">{form.location_address}</p>
                  )}
                  {form.yandex_map_url && (
                    <a
                      href={form.yandex_map_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Открыть на карте
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <Label className="text-base font-semibold">Спикеры</Label>
              {speakers.length === 0 ? (
                <p className="text-sm text-muted-foreground mt-2">
                  Нет доступных спикеров. Добавьте спикеров во вкладке "Спикеры".
                </p>
              ) : (
                <div className="space-y-3 mt-2">
                  {speakers.map((speaker) => {
                    const isSelected = selectedSpeakers.some(
                      (s) => s.speaker_id === speaker.id
                    );
                    const speakerData = selectedSpeakers.find(
                      (s) => s.speaker_id === speaker.id
                    );

                    return (
                      <div
                        key={speaker.id}
                        className="border rounded-lg p-3 space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`speaker-${speaker.id}`}
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                              handleSpeakerToggle(speaker.id, checked as boolean)
                            }
                          />
                          <label
                            htmlFor={`speaker-${speaker.id}`}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            {speaker.photo_url && (
                              <img
                                src={speaker.photo_url}
                                alt={speaker.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            )}
                            <div>
                              <span className="font-medium">{speaker.name}</span>
                              {speaker.title && (
                                <span className="text-sm text-muted-foreground ml-2">
                                  {speaker.title}
                                </span>
                              )}
                            </div>
                          </label>
                        </div>

                        {isSelected && (
                          <div className="pl-6 space-y-2">
                            <Input
                              placeholder="Тема выступления"
                              value={speakerData?.talk_title || ""}
                              onChange={(e) =>
                                handleSpeakerDetailChange(
                                  speaker.id,
                                  "talk_title",
                                  e.target.value
                                )
                              }
                            />
                            <Textarea
                              placeholder="Описание выступления"
                              value={speakerData?.talk_description || ""}
                              onChange={(e) =>
                                handleSpeakerDetailChange(
                                  speaker.id,
                                  "talk_description",
                                  e.target.value
                                )
                              }
                              rows={2}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <Label className="text-base font-semibold">Регистрация</Label>
              <div className="space-y-2 mt-2">
                <Label htmlFor="telegram_bot_url">Ссылка на Telegram бот</Label>
                <Input
                  id="telegram_bot_url"
                  name="telegram_bot_url"
                  value={form.telegram_bot_url}
                  onChange={handleChange}
                  placeholder="https://t.me/..."
                />
              </div>
              <div className="space-y-2 mt-2">
                <Label htmlFor="registration_info">
                  Дополнительная информация о регистрации
                </Label>
                <Textarea
                  id="registration_info"
                  name="registration_info"
                  value={form.registration_info}
                  onChange={handleChange}
                  rows={2}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 border-t pt-4">
              <Switch
                id="is_published"
                checked={form.is_published}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="is_published">Опубликовать мероприятие</Label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenDialog(false)}
              >
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
