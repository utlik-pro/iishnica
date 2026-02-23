import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  MapPin,
  Users,
  Send,
  Eye,
  Settings,
  X,
  Save,
  ArrowLeft,
  Calendar,
  Clock,
  Wallet,
  Copy,
  Loader2,
  Wand2,
  Building2,
} from "lucide-react";
import { TIER_LABELS, type SponsorTier } from "@/lib/sponsor-tiers";

interface Location {
  id: string;
  name: string;
  address: string | null;
  photo_url: string | null;
  yandex_map_url: string | null;
}

interface Speaker {
  id: string;
  name: string;
  title: string | null;
  photo_url: string | null;
}

interface EventSpeaker {
  speaker_id: string;
  talk_title: string;
  talk_description: string;
  order_index: number;
}

interface SponsorOption {
  id: string;
  name: string;
  logo_url: string | null;
  tier: SponsorTier;
}

interface SelectedSponsor {
  sponsor_id: string;
  tier: SponsorTier | null; // null = use global default
}

interface EventForm {
  title: string;
  description: string;
  date: string;
  time: string;
  duration_minutes: number;
  price: number;
  registration_info: string;
  location_name: string;
  location_address: string;
  yandex_map_url: string;
  telegram_bot_url: string;
  is_published: boolean;
  slug: string;
}

interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  duration_minutes: number;
  price: number;
  registration_info: string | null;
  location_name: string | null;
  location_address: string | null;
  yandex_map_url: string | null;
  telegram_bot_url: string | null;
  is_published: boolean;
  slug: string | null;
}

interface EventEditorProps {
  event: Event | null;
  onClose: () => void;
  onSave: () => void;
}

type Section = "basic" | "location" | "speakers" | "sponsors" | "registration" | "publish";

const sections = [
  { id: "basic" as Section, label: "Основное", icon: FileText },
  { id: "location" as Section, label: "Локация", icon: MapPin },
  { id: "speakers" as Section, label: "Спикеры", icon: Users },
  { id: "sponsors" as Section, label: "Спонсоры", icon: Building2 },
  { id: "registration" as Section, label: "Регистрация", icon: Send },
  { id: "publish" as Section, label: "Публикация", icon: Settings },
];

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

const EventEditor: React.FC<EventEditorProps> = ({ event, onClose, onSave }) => {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<Section>("basic");
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const [selectedSpeakers, setSelectedSpeakers] = useState<EventSpeaker[]>([]);
  const [allSponsors, setAllSponsors] = useState<SponsorOption[]>([]);
  const [selectedSponsors, setSelectedSponsors] = useState<SelectedSponsor[]>([]);
  const [saving, setSaving] = useState(false);
  const [isResolvingUrl, setIsResolvingUrl] = useState(false);

  const [form, setForm] = useState<EventForm>({
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
    telegram_bot_url: "https://t.me/maincomapp_bot",
    is_published: false,
    slug: "",
  });

  useEffect(() => {
    fetchSpeakers();
    fetchLocations();
    fetchAllSponsors();
    if (event) {
      loadEvent(event);
    }
  }, [event]);

  const loadEvent = async (evt: Event) => {
    const eventDate = new Date(evt.date);
    setForm({
      title: evt.title,
      description: evt.description || "",
      date: eventDate.toISOString().split("T")[0],
      time: eventDate.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", hour12: false }),
      duration_minutes: evt.duration_minutes,
      price: evt.price,
      registration_info: evt.registration_info || "",
      location_name: evt.location_name || "",
      location_address: evt.location_address || "",
      yandex_map_url: evt.yandex_map_url || "",
      telegram_bot_url: evt.telegram_bot_url || "https://t.me/maincomapp_bot",
      is_published: evt.is_published,
      slug: evt.slug || "",
    });

    // Fetch event speakers
    const { data: speakersData } = await supabase
      .from("event_speakers")
      .select("speaker_id, talk_title, talk_description, order_index")
      .eq("event_id", evt.id)
      .order("order_index");

    if (speakersData) {
      setSelectedSpeakers(
        speakersData.map((es) => ({
          speaker_id: es.speaker_id,
          talk_title: es.talk_title || "",
          talk_description: es.talk_description || "",
          order_index: es.order_index,
        }))
      );
    }

    // Fetch event sponsors
    const { data: eventSponsorsData } = await supabase
      .from("event_sponsors")
      .select("sponsor_id, tier")
      .eq("event_id", evt.id);

    if (eventSponsorsData) {
      setSelectedSponsors(
        eventSponsorsData
          .filter((es) => es.sponsor_id)
          .map((es) => ({
            sponsor_id: es.sponsor_id!,
            tier: es.tier as SponsorTier | null,
          }))
      );
    }
  };

  const fetchSpeakers = async () => {
    const { data } = await supabase
      .from("speakers")
      .select("id, name, title, photo_url")
      .eq("is_active", true)
      .order("name");
    setSpeakers(data || []);
  };

  const fetchAllSponsors = async () => {
    const { data } = await supabase
      .from("sponsors")
      .select("id, name, logo_url, tier")
      .eq("is_active", true)
      .order("name");
    setAllSponsors((data as SponsorOption[]) || []);
  };

  const fetchLocations = async () => {
    const { data } = await supabase
      .from("locations")
      .select("id, name, address, photo_url, yandex_map_url")
      .eq("is_active", true)
      .order("name");
    setLocations(data || []);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "price" || name === "duration_minutes" ? parseFloat(value) || 0 : value,
    });
  };

  const handleLocationSelect = (locationId: string) => {
    setSelectedLocationId(locationId);
    if (locationId === "custom") return;
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

  const resolveYandexUrl = async () => {
    if (!form.yandex_map_url) {
      toast({
        title: "Введите ссылку",
        description: "Сначала вставьте ссылку на Яндекс Карты",
        variant: "destructive",
      });
      return;
    }

    setIsResolvingUrl(true);
    try {
      const { data, error } = await supabase.functions.invoke('resolve-yandex-url', {
        body: { url: form.yandex_map_url }
      });

      if (error) throw error;

      if (data.widgetUrl) {
        setForm({ ...form, yandex_map_url: data.widgetUrl });
        toast({
          title: "Готово!",
          description: "Ссылка преобразована в виджет карты",
        });
      } else {
        toast({
          title: "Не удалось получить координаты",
          description: "Попробуйте скопировать полную ссылку из адресной строки браузера",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось обработать ссылку",
        variant: "destructive",
      });
    } finally {
      setIsResolvingUrl(false);
    }
  };

  const handleSpeakerToggle = (speakerId: string, checked: boolean) => {
    if (checked) {
      setSelectedSpeakers([
        ...selectedSpeakers,
        { speaker_id: speakerId, talk_title: "", talk_description: "", order_index: selectedSpeakers.length },
      ]);
    } else {
      setSelectedSpeakers(selectedSpeakers.filter((s) => s.speaker_id !== speakerId));
    }
  };

  const handleSponsorToggle = (sponsorId: string, checked: boolean) => {
    if (checked) {
      setSelectedSponsors([...selectedSponsors, { sponsor_id: sponsorId, tier: null }]);
    } else {
      setSelectedSponsors(selectedSponsors.filter((s) => s.sponsor_id !== sponsorId));
    }
  };

  const handleSponsorTierChange = (sponsorId: string, tier: string) => {
    setSelectedSponsors(
      selectedSponsors.map((s) =>
        s.sponsor_id === sponsorId ? { ...s, tier: tier === "default" ? null : tier as SponsorTier } : s
      )
    );
  };

  const handleSpeakerDetailChange = (speakerId: string, field: "talk_title" | "talk_description", value: string) => {
    setSelectedSpeakers(
      selectedSpeakers.map((s) => (s.speaker_id === speakerId ? { ...s, [field]: value } : s))
    );
  };

  const handleSubmit = async () => {
    setSaving(true);
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

      if (event) {
        const { error } = await supabase.from("events").update(eventData).eq("id", event.id);
        if (error) throw error;
        eventId = event.id;
      } else {
        const { data, error } = await supabase.from("events").insert([eventData]).select("id").single();
        if (error) throw error;
        eventId = data.id;
      }

      // Update speakers
      await supabase.from("event_speakers").delete().eq("event_id", eventId);
      if (selectedSpeakers.length > 0) {
        const speakerInserts = selectedSpeakers.map((s, index) => ({
          event_id: eventId,
          speaker_id: s.speaker_id,
          talk_title: s.talk_title || null,
          talk_description: s.talk_description || null,
          order_index: index,
        }));
        await supabase.from("event_speakers").insert(speakerInserts);
      }

      // Update sponsors
      await supabase.from("event_sponsors").delete().eq("event_id", eventId);
      if (selectedSponsors.length > 0) {
        const sponsorInserts = selectedSponsors.map((s) => ({
          event_id: eventId,
          sponsor_id: s.sponsor_id,
          tier: s.tier,
        }));
        await supabase.from("event_sponsors").insert(sponsorInserts);
      }

      // Sync with bot_events
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

      const { data: existingBotEvent } = await supabase
        .from("bot_events")
        .select("id")
        .eq("web_event_id", eventId)
        .single();

      if (existingBotEvent) {
        await supabase.from("bot_events").update(botEventData).eq("web_event_id", eventId);
      } else {
        await supabase.from("bot_events").insert([botEventData]);
      }

      toast({ title: "Сохранено", description: "Мероприятие успешно сохранено" });
      onSave();
    } catch (error) {
      console.error("Error saving event:", error);
      toast({ title: "Ошибка", description: "Не удалось сохранить мероприятие", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const formatPreviewDate = () => {
    if (!form.date) return "";
    const date = new Date(form.date);
    return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long", weekday: "long" });
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="border-b px-6 py-4 flex items-center justify-between bg-background">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          <div>
            <h1 className="text-xl font-semibold">
              {event ? "Редактирование мероприятия" : "Новое мероприятие"}
            </h1>
            <p className="text-sm text-muted-foreground">{form.title || "Без названия"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={form.is_published ? "default" : "secondary"}>
            {form.is_published ? "Опубликовано" : "Черновик"}
          </Badge>
          <Button onClick={handleSubmit} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Navigation */}
        <div className="w-56 border-r bg-muted/30 p-4">
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${activeSection === section.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                  }`}
              >
                <section.icon className="h-4 w-4" />
                <span className="text-sm">{section.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Center - Form */}
        <div className="flex-1 overflow-auto">
          <ScrollArea className="h-full">
            <div className="max-w-2xl mx-auto p-8">
              {activeSection === "basic" && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold">Основная информация</h2>

                  <div className="space-y-2">
                    <Label htmlFor="title">Название мероприятия</Label>
                    <Input
                      id="title"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="Вечерняя ИИшница #5"
                      className="text-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">URL-адрес</Label>
                    <div className="flex gap-2">
                      <Input
                        id="slug"
                        name="slug"
                        value={form.slug}
                        onChange={handleChange}
                        placeholder="iishnica-5"
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
                      /event/{form.slug || "..."}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Описание</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Краткое описание мероприятия..."
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
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Время начала</Label>
                      <Input
                        id="time"
                        name="time"
                        type="time"
                        value={form.time}
                        onChange={handleChange}
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
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "location" && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold">Место проведения</h2>

                  <div className="space-y-2">
                    <Label>Выберите локацию</Label>
                    <Select value={selectedLocationId} onValueChange={handleLocationSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите из списка или введите вручную" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">Ввести вручную...</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(selectedLocationId === "custom" || selectedLocationId === "") && (
                    <>
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
                      <div className="space-y-2">
                        <Label htmlFor="yandex_map_url">Ссылка на Яндекс.Карты</Label>
                        <div className="flex gap-2">
                          <Input
                            id="yandex_map_url"
                            name="yandex_map_url"
                            value={form.yandex_map_url}
                            onChange={handleChange}
                            placeholder="Вставьте любую ссылку (короткую или полную)"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={resolveYandexUrl}
                            disabled={isResolvingUrl || !form.yandex_map_url}
                            title="Получить координаты"
                          >
                            {isResolvingUrl ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Wand2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Вставьте ссылку и нажмите кнопку для автоматического получения координат
                        </p>
                      </div>
                    </>
                  )}

                  {selectedLocationId && selectedLocationId !== "custom" && (
                    <Card>
                      <CardContent className="p-4">
                        <p className="font-medium">{form.location_name}</p>
                        {form.location_address && (
                          <p className="text-sm text-muted-foreground">{form.location_address}</p>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {activeSection === "speakers" && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold">Спикеры</h2>

                  {speakers.length === 0 ? (
                    <p className="text-muted-foreground">Нет доступных спикеров</p>
                  ) : (
                    <div className="space-y-4">
                      {speakers.map((speaker) => {
                        const isSelected = selectedSpeakers.some((s) => s.speaker_id === speaker.id);
                        const speakerData = selectedSpeakers.find((s) => s.speaker_id === speaker.id);

                        return (
                          <Card key={speaker.id} className={isSelected ? "border-primary" : ""}>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={(checked) => handleSpeakerToggle(speaker.id, checked as boolean)}
                                />
                                {speaker.photo_url && (
                                  <img
                                    src={speaker.photo_url}
                                    alt={speaker.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                )}
                                <div>
                                  <p className="font-medium">{speaker.name}</p>
                                  {speaker.title && (
                                    <p className="text-sm text-muted-foreground">{speaker.title}</p>
                                  )}
                                </div>
                              </div>

                              {isSelected && (
                                <div className="mt-4 space-y-3 pl-8">
                                  <Input
                                    placeholder="Тема выступления"
                                    value={speakerData?.talk_title || ""}
                                    onChange={(e) =>
                                      handleSpeakerDetailChange(speaker.id, "talk_title", e.target.value)
                                    }
                                  />
                                  <Textarea
                                    placeholder="Описание выступления"
                                    value={speakerData?.talk_description || ""}
                                    onChange={(e) =>
                                      handleSpeakerDetailChange(speaker.id, "talk_description", e.target.value)
                                    }
                                    rows={2}
                                  />
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeSection === "sponsors" && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold">Спонсоры мероприятия</h2>
                  <p className="text-sm text-muted-foreground">
                    Выберите спонсоров. Тип по умолчанию берётся из настроек спонсора, но можно переопределить для этого мероприятия.
                  </p>

                  {allSponsors.length === 0 ? (
                    <p className="text-muted-foreground">Нет доступных спонсоров</p>
                  ) : (
                    <div className="space-y-4">
                      {allSponsors.map((sponsor) => {
                        const isSelected = selectedSponsors.some((s) => s.sponsor_id === sponsor.id);
                        const sponsorData = selectedSponsors.find((s) => s.sponsor_id === sponsor.id);

                        return (
                          <Card key={sponsor.id} className={isSelected ? "border-primary" : ""}>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={(checked) => handleSponsorToggle(sponsor.id, checked as boolean)}
                                />
                                {sponsor.logo_url && (
                                  <img
                                    src={sponsor.logo_url}
                                    alt={sponsor.name}
                                    className="w-10 h-10 rounded object-contain"
                                  />
                                )}
                                <div>
                                  <p className="font-medium">{sponsor.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    По умолчанию: {TIER_LABELS[sponsor.tier]}
                                  </p>
                                </div>
                              </div>

                              {isSelected && (
                                <div className="mt-4 pl-8">
                                  <Label className="text-sm">Тип для этого мероприятия</Label>
                                  <Select
                                    value={sponsorData?.tier || "default"}
                                    onValueChange={(val) => handleSponsorTierChange(sponsor.id, val)}
                                  >
                                    <SelectTrigger className="mt-1">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="default">По умолчанию ({TIER_LABELS[sponsor.tier]})</SelectItem>
                                      <SelectItem value="general_partner">Генеральный партнёр</SelectItem>
                                      <SelectItem value="partner">Партнёр</SelectItem>
                                      <SelectItem value="sponsor">Спонсор</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeSection === "registration" && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold">Регистрация</h2>

                  <div className="space-y-2">
                    <Label>Ссылка для регистрации</Label>
                    {event?.id ? (
                      <div className="flex gap-2">
                        <Input
                          value={`https://t.me/maincomapp_bot?startapp=event_${event.id}`}
                          readOnly
                          className="bg-muted"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            navigator.clipboard.writeText(`https://t.me/maincomapp_bot?startapp=event_${event.id}`);
                            toast({
                              title: "Скопировано",
                              description: "Ссылка скопирована в буфер обмена",
                            });
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Сохраните событие, чтобы получить ссылку для регистрации
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registration_info">Дополнительная информация</Label>
                    <Textarea
                      id="registration_info"
                      name="registration_info"
                      value={form.registration_info}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Информация о регистрации, оплате и т.д."
                    />
                  </div>
                </div>
              )}

              {activeSection === "publish" && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold">Публикация</h2>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Опубликовать мероприятие</p>
                          <p className="text-sm text-muted-foreground">
                            Мероприятие будет доступно на сайте
                          </p>
                        </div>
                        <Switch
                          checked={form.is_published}
                          onCheckedChange={(checked) => setForm({ ...form, is_published: checked })}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {form.is_published && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        Ссылка на мероприятие:{" "}
                        <span className="font-mono">
                          /event/{form.slug || generateSlug(form.title)}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right Sidebar - Preview */}
        <div className="w-96 border-l bg-muted/30 flex flex-col">
          <div className="p-4 border-b flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span className="font-medium">Превью</span>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4">
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {/* Mini preview of event page */}
                <div className="p-6 space-y-4">
                  <Badge variant={form.is_published ? "default" : "secondary"} className="mb-2">
                    {form.is_published ? "Опубликовано" : "Черновик"}
                  </Badge>

                  <h3 className="text-xl font-bold">
                    {form.title || "Название мероприятия"}
                  </h3>

                  {form.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {form.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 text-xs">
                    {form.date && (
                      <div className="flex items-center gap-1 bg-green-100 px-3 py-1.5 rounded-full">
                        <Calendar className="h-3 w-3 text-green-600" />
                        <span>{formatPreviewDate()}</span>
                      </div>
                    )}
                    {form.time && (
                      <div className="flex items-center gap-1 bg-blue-100 px-3 py-1.5 rounded-full">
                        <Clock className="h-3 w-3 text-blue-600" />
                        <span>{form.time}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 bg-purple-100 px-3 py-1.5 rounded-full">
                      <Wallet className="h-3 w-3 text-purple-600" />
                      <span>{form.price > 0 ? `${form.price} BYN` : "Бесплатно"}</span>
                    </div>
                  </div>

                  {form.location_name && (
                    <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">{form.location_name}</p>
                        {form.location_address && (
                          <p className="text-xs text-muted-foreground">{form.location_address}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedSpeakers.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Спикеры:</p>
                      <div className="space-y-2">
                        {selectedSpeakers.map((s) => {
                          const speaker = speakers.find((sp) => sp.id === s.speaker_id);
                          if (!speaker) return null;
                          return (
                            <div key={s.speaker_id} className="flex items-center gap-2">
                              {speaker.photo_url && (
                                <img
                                  src={speaker.photo_url}
                                  alt={speaker.name}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              )}
                              <div>
                                <p className="text-sm font-medium">{speaker.name}</p>
                                {s.talk_title && (
                                  <p className="text-xs text-muted-foreground">{s.talk_title}</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selectedSponsors.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Спонсоры:</p>
                      <div className="space-y-1">
                        {selectedSponsors.map((s) => {
                          const sponsor = allSponsors.find((sp) => sp.id === s.sponsor_id);
                          if (!sponsor) return null;
                          const effectiveTier = s.tier || sponsor.tier;
                          return (
                            <div key={s.sponsor_id} className="flex items-center gap-2">
                              {sponsor.logo_url && (
                                <img
                                  src={sponsor.logo_url}
                                  alt={sponsor.name}
                                  className="w-6 h-6 rounded object-contain"
                                />
                              )}
                              <span className="text-sm">{sponsor.name}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded ${
                                effectiveTier === 'general_partner' ? 'bg-yellow-100 text-yellow-800' :
                                effectiveTier === 'partner' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {TIER_LABELS[effectiveTier]}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <Button className="w-full" size="sm">
                    Зарегистрироваться
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default EventEditor;
