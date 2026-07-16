import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowUp, MapPin, Users, Calendar as CalendarIcon, Presentation, Ticket, Code2, Mic, Coffee } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventLocationMap from "@/components/EventLocationMap";
import { getEventCover } from "@/lib/event-covers";
import { PARTNER_LOGOS } from "@/lib/partners";

interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  duration_minutes: number;
  price: number;
  location_name: string | null;
  location_address: string | null;
  yandex_map_url: string | null;
  telegram_bot_url: string | null;
  is_published: boolean;
  slug: string | null;
  cover_image_url: string | null;
}

interface Speaker {
  id: string;
  name: string;
  title: string | null;
  description: string | null;
  photo_url: string | null;
}

interface EventSpeaker {
  speaker_id: string;
  talk_title: string | null;
  talk_description: string | null;
  order_index: number;
  speaker: Speaker;
}

interface Sponsor {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  effectiveTier: 'general_partner' | 'partner' | 'sponsor';
}

interface ProgramItem {
  id: string;
  time_start: string;
  time_end: string;
  title: string;
  description: string | null;
  type: string;
  speaker_id: string | null;
  order_index: number;
  speaker?: Speaker;
}

const FEATURES = [
  { title: "Только практика", desc: "Реальные кейсы с кодом, метриками и граблями", icon: Code2 },
  { title: "Нетворкинг", desc: "Инженеры, фаундеры и продакты за одним столом", icon: Users },
  { title: "Открытый микрофон", desc: "Задавайте вопросы спикерам напрямую", icon: Mic },
  { title: "Кофе и общение", desc: "Тёплая атмосфера — часть ритуала «ИИшницы»", icon: Coffee },
];

const FAQS = [
  { q: "Это правда бесплатно?", a: "Да, участие в «ИИшнице» бесплатное. Мы просим регистрацию только чтобы понимать число гостей и подготовить достаточно кофе и мест." },
  { q: "Нужен ли технический бэкграунд?", a: "Не обязательно. Доклады рассчитаны на разный уровень — от продактов до сеньор-инженеров. Всегда есть вводная часть и время на вопросы." },
  { q: "Будет ли запись?", a: "Да, видео докладов и слайды мы присылаем всем зарегистрированным участникам в течение недели после митапа." },
  { q: "Можно прийти с коллегой?", a: "Конечно. Просто попросите его тоже зарегистрироваться — так мы точно всех разместим и никого не оставим без места." },
];


const EventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [speakers, setSpeakers] = useState<EventSpeaker[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [program, setProgram] = useState<ProgramItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [regCount, setRegCount] = useState<number | null>(null);
  const [communityCount, setCommunityCount] = useState<number | null>(null);

  // UI
  const [openFaq, setOpenFaq] = useState<number>(0);
  const [showTop, setShowTop] = useState(false);
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (id) fetchEvent(id);
  }, [id]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Размер сообщества (в приложении + чате) и логотипы партнёров — как в мини-аппе
  useEffect(() => {
    (async () => {
      const [{ count: users }, settingRes] = await Promise.all([
        supabase.from("bot_users").select("*", { count: "exact", head: true }),
        supabase.from("app_settings").select("value").eq("key", "community_chat_members").maybeSingle(),
      ]);
      const chat = Number(settingRes.data?.value) || 0;
      if (typeof users === "number") setCommunityCount(users + chat);
    })();
  }, []);

  const fetchEvent = async (eventIdOrSlug: string) => {
    setLoading(true);
    setError(null);
    try {
      let eventData = null;
      let eventError = null;

      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(eventIdOrSlug);

      if (!isUUID) {
        const slugResult = await supabase
          .from("events")
          .select("*")
          .eq("slug", eventIdOrSlug)
          .single();
        if (!slugResult.error) eventData = slugResult.data;
      }

      if (!eventData) {
        const idResult = await supabase
          .from("events")
          .select("*")
          .eq("id", eventIdOrSlug)
          .single();
        eventData = idResult.data;
        eventError = idResult.error;
      }

      if (eventError || !eventData) {
        setError("Мероприятие не найдено");
        return;
      }
      if (!eventData.is_published) {
        setError("Мероприятие не опубликовано");
        return;
      }

      setEvent(eventData);

      const { data: speakersData, error: speakersError } = await supabase
        .from("event_speakers")
        .select(`
          speaker_id,
          talk_title,
          talk_description,
          order_index,
          speaker:speakers ( id, name, title, description, photo_url )
        `)
        .eq("event_id", eventData.id)
        .order("order_index");

      if (speakersError) throw speakersError;
      setSpeakers((speakersData || []).map((item: any) => ({
        speaker_id: item.speaker_id,
        talk_title: item.talk_title,
        talk_description: item.talk_description,
        order_index: item.order_index,
        speaker: item.speaker,
      })));

      const { data: eventSponsorsData } = await supabase
        .from("event_sponsors")
        .select(`
          tier,
          sponsor:sponsors ( id, name, logo_url, website_url, tier )
        `)
        .eq("event_id", eventData.id);

      // только реальные партнёры события (без общего фолбэка)
      setSponsors((eventSponsorsData || [])
        .map((item: any) => item.sponsor ? { ...item.sponsor, effectiveTier: item.tier || item.sponsor.tier || 'sponsor' } : null)
        .filter(Boolean) as Sponsor[]);

      const { data: programData } = await supabase
        .from("event_program")
        .select(`
          id, time_start, time_end, title, description, type, speaker_id, order_index,
          speaker:speakers ( id, name, title, description, photo_url )
        `)
        .eq("event_id", eventData.id)
        .order("order_index");

      if (programData) setProgram(programData as ProgramItem[]);

      // Число регистраций из мини-аппа (bot_registrations через связанный bot_event)
      const { data: botEv } = await supabase
        .from("bot_events")
        .select("id")
        .eq("web_event_id", eventData.id)
        .limit(1);
      if (botEv && botEv[0]) {
        const { count } = await supabase
          .from("bot_registrations")
          .select("*", { count: "exact", head: true })
          .eq("event_id", botEv[0].id);
        if (typeof count === "number") setRegCount(count);
      }
    } catch (err) {
      console.error("Error fetching event:", err);
      setError("Ошибка загрузки мероприятия");
    } finally {
      setLoading(false);
    }
  };

  const formatDateFull = (dateString: string) =>
    new Date(dateString).toLocaleDateString("ru-RU", { day: "numeric", month: "long", weekday: "long" });
  const formatDateShort = (dateString: string) =>
    new Date(dateString).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
  const formatWeekday = (dateString: string) =>
    new Date(dateString).toLocaleDateString("ru-RU", { weekday: "long" });
  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const formatProgramTime = (t: string) => t.slice(0, 5);
  const pluralRu = (n: number, one: string, few: string, many: string) => {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
    return many;
  };

  const openBot = () => {
    if (event) window.open(`https://telegram.me/maincomapp_bot?startapp=event_${event.id}`, "_blank");
  };
  const scrollToId = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="flex-grow flex items-center justify-center pt-28">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="flex-grow flex items-center justify-center pt-28 pb-16">
          <div className="text-center">
            <h1 className="text-3xl font-heading font-bold mb-4">{error || "Мероприятие не найдено"}</h1>
            <Button onClick={() => navigate("/")} variant="outline">Вернуться на главную</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const cover = event.cover_image_url || getEventCover(event.slug);
  const numMatch = event.title.match(/#?\s*(\d+)/);
  const priceLabel = event.price > 0 ? `${event.price} BYN` : "Бесплатно";
  const titleParts = event.title.split(/(ИИшница)/g);

  const msLeft = Math.max(0, new Date(event.date).getTime() - now);
  const countdown = [
    { v: Math.floor(msLeft / 86400000), l: "дни" },
    { v: Math.floor((msLeft % 86400000) / 3600000), l: "часы" },
    { v: Math.floor((msLeft % 3600000) / 60000), l: "мин" },
    { v: Math.floor((msLeft % 60000) / 1000), l: "сек" },
  ];

  const metaCards = [
    { label: "Дата", value: formatDateShort(event.date), sub: `${formatWeekday(event.date)}, ${formatTime(event.date)}`, icon: CalendarIcon },
    { label: "Место", value: event.location_name || "Минск", sub: event.location_address || "уточняется", icon: MapPin },
    { label: "Формат", value: "Офлайн", sub: program.length > 0 ? `${program.length} ${pluralRu(program.length, "доклад", "доклада", "докладов")} + Q&A` : "митап + Q&A", icon: Presentation },
    { label: "Участие", value: priceLabel, sub: "по регистрации", icon: Ticket },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <Navbar />

      {/* ambient glows */}
      <div aria-hidden className="pointer-events-none absolute top-[-140px] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full z-0"
        style={{ background: "radial-gradient(ellipse at center, hsl(var(--primary)/0.14), transparent 65%)" }} />
      <div aria-hidden className="pointer-events-none absolute top-[1300px] right-[-200px] w-[600px] h-[600px] rounded-full z-0"
        style={{ background: "radial-gradient(circle at center, hsl(var(--primary)/0.07), transparent 65%)" }} />

      {/* HERO */}
      <header className="relative z-[1] max-w-[1240px] mx-auto px-5 md:px-8 pt-24 md:pt-32 pb-6 md:pb-10">
        <div className="inline-flex items-center gap-3 mb-6 md:mb-7">
          <span className="px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground text-[11px] md:text-xs font-bold uppercase tracking-[0.12em]">
            Митап{numMatch ? ` №${numMatch[1]}` : ""}
          </span>
          <span className="text-muted-foreground text-xs md:text-sm font-semibold uppercase tracking-[0.16em]">
            M.AI.N Community
          </span>
        </div>

        <div className="max-w-[820px]">
          <h1 className="font-heading font-black tracking-tight leading-[0.95] text-5xl sm:text-6xl md:text-7xl lg:text-[104px] mb-5 md:mb-6">
            {titleParts.map((part, i) =>
              part === "ИИшница"
                ? <span key={i} className="gradient-text">{part}</span>
                : <span key={i} className="text-foreground">{part}</span>
            )}
          </h1>
          {event.description && (
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-[560px] mb-6 md:mb-7">
              {event.description}
            </p>
          )}

          {/* countdown */}
          {msLeft > 0 && (
            <div className="mb-7 md:mb-8">
              <div className="text-[11px] md:text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/70 mb-3">
                До события осталось
              </div>
              <div className="flex gap-2.5 md:gap-3">
                {countdown.map((u) => (
                  <div
                    key={u.l}
                    className="flex-1 sm:flex-none sm:min-w-[82px] bg-card border border-white/[0.08] rounded-2xl px-2 py-3 md:px-4 md:py-4 text-center"
                  >
                    <div className="font-heading font-black text-2xl md:text-[40px] text-primary tabular-nums leading-none">
                      {String(u.v).padStart(2, "0")}
                    </div>
                    <div className="text-[10px] md:text-[11px] uppercase tracking-[0.1em] text-muted-foreground mt-1.5 md:mt-2">
                      {u.l}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {regCount !== null && regCount > 0 && (
            <div className="flex items-baseline gap-3 mb-7 md:mb-8">
              <span className="font-heading font-black text-5xl md:text-6xl text-primary tabular-nums leading-none tracking-tight">
                {regCount}
              </span>
              <span className="text-base md:text-lg text-muted-foreground font-medium">
                уже зарегистрировались
              </span>
            </div>
          )}
          <div className="flex flex-wrap gap-3.5 items-center">
            <button
              onClick={openBot}
              className="inline-flex items-center gap-2.5 rounded-full bg-primary text-primary-foreground font-bold text-base md:text-[17px] px-7 md:px-8 py-4 md:py-[17px] shadow-lime hover:bg-lime-dark hover:-translate-y-0.5 transition-all"
            >
              Зарегистрироваться <ArrowRight className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>

        {/* speakers banner */}
        {cover && (
          <div className="relative mt-11 md:mt-12 rounded-[28px] overflow-hidden border border-white/[0.08] shadow-card">
            <img
              src={cover}
              alt={event.title}
              onError={(e) => {
                const img = e.currentTarget as HTMLImageElement;
                if (!img.src.endsWith("/og-image.png")) img.src = "/og-image.png";
              }}
              className="block w-full h-auto"
            />
            {speakers.length > 0 && (
              <div className="absolute top-4 right-4 md:top-5 md:right-5 rounded-2xl px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm font-heading font-semibold text-primary bg-background/60 backdrop-blur-md border border-white/[0.12]">
                {speakers.length} {speakers.length === 1 ? "спикер" : "спикера"} · {numMatch ? `${numMatch[1]}-й выпуск` : "митап"}
              </div>
            )}
          </div>
        )}

        {/* meta strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-10 md:mt-14">
          {metaCards.map((m) => (
            <div
              key={m.label}
              className="group relative overflow-hidden bg-card border border-white/[0.07] rounded-[22px] p-5 md:p-6 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300"
            >
              <div aria-hidden className="pointer-events-none absolute -top-10 -right-10 w-24 h-24 rounded-full bg-primary/[0.07] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center justify-between mb-4 md:mb-5">
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground/60">{m.label}</span>
                <span className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <m.icon className="w-[18px] h-[18px]" />
                </span>
              </div>
              <div className="relative font-heading font-bold text-lg md:text-[22px] leading-tight text-foreground">{m.value}</div>
              <div className="relative text-[13px] md:text-sm text-muted-foreground mt-1.5 truncate">{m.sub}</div>
            </div>
          ))}
        </div>
      </header>

      {/* PARTNERS MARQUEE */}
      <div className="relative z-[1] my-12 md:my-14 border-y border-white/[0.08] py-7 md:py-8 overflow-hidden">
        <div className="text-center text-[11px] md:text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-5 md:mb-6">
          Партнёры сообщества
        </div>
        <div className="overflow-hidden whitespace-nowrap [mask-image:linear-gradient(90deg,transparent,#000_7%,#000_93%,transparent)]">
          <div className="inline-flex items-center gap-10 md:gap-16 animate-marquee will-change-transform pr-10 md:pr-16">
            {[0, 1].flatMap((rep) =>
              PARTNER_LOGOS.map((p, i) => (
                <img
                  key={`${rep}-${i}`}
                  src={p.src}
                  alt={p.name}
                  className="h-6 md:h-8 w-auto object-contain shrink-0 brightness-0 invert opacity-60 hover:opacity-100 transition-opacity"
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* ABOUT */}
      <section id="about" className="relative z-[1] max-w-[1240px] mx-auto px-5 md:px-8 py-10 md:py-14">
        <div className="grid md:grid-cols-[0.9fr_1.1fr] gap-9 md:gap-16 items-start">
          <div>
            <div className="text-[13px] md:text-sm font-bold uppercase tracking-widest text-primary mb-4">О митапе</div>
            <h2 className="font-heading font-bold tracking-tight leading-[1.02] text-3xl md:text-5xl text-foreground">
              Вечер, на котором обсуждают ИИ всерьёз
            </h2>
            {communityCount !== null && (
              <div className="mt-7 md:mt-9 inline-flex items-baseline gap-3">
                <span className="font-heading font-black text-4xl md:text-5xl text-primary tabular-nums leading-none">
                  {communityCount.toLocaleString("ru-RU")}
                </span>
                <span className="text-base md:text-lg text-muted-foreground leading-tight">
                  участников<br className="hidden md:block" /> в сообществе
                </span>
              </div>
            )}
          </div>
          <div>
            <p className="text-lg md:text-[19px] leading-relaxed text-foreground/80 mb-7">
              «ИИшница» — регулярные встречи сообщества <b className="text-foreground">M.AI.N</b>, где инженеры, продакты и фаундеры делятся реальным опытом внедрения ИИ. Никаких продающих докладов — только практика, разбор кейсов и живое общение за чашкой кофе.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FEATURES.map((f) => (
                <div key={f.title} className="flex gap-3.5 items-start group">
                  <div className="flex-shrink-0 w-[42px] h-[42px] rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <f.icon className="w-[18px] h-[18px]" />
                  </div>
                  <div>
                    <div className="font-bold text-base text-foreground mb-0.5">{f.title}</div>
                    <div className="text-sm text-muted-foreground leading-snug">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* community photo */}
        <div className="mt-10 md:mt-14 rounded-[24px] overflow-hidden border border-white/[0.08] relative shadow-card">
          <img src="/og-image.png" alt="Сообщество M.AI.N" className="w-full aspect-[21/9] object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-5 md:bottom-6 md:left-8 flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-primary shadow-lime-sm" />
            <span className="text-sm md:text-base font-semibold text-foreground">Живые встречи M.AI.N Community</span>
          </div>
        </div>
      </section>

      {/* PROGRAM */}
      {program.length > 0 && (
        <section id="program" className="relative z-[1] max-w-[1240px] mx-auto px-5 md:px-8 py-14 md:py-[72px]">
          <div className="flex items-end justify-between flex-wrap gap-5 mb-11">
            <div>
              <div className="text-[13px] md:text-sm font-bold uppercase tracking-widest text-primary mb-4">Программа</div>
              <h2 className="font-heading font-bold tracking-tight text-3xl md:text-5xl text-foreground">Тайминг вечера</h2>
            </div>
            <div className="text-[15px] text-muted-foreground max-w-[340px]">
              Доклады, нетворкинг и Q&A. Начинаем в {formatTime(event.date)}, заканчиваем открытым микрофоном.
            </div>
          </div>
          <div className="flex flex-col gap-3.5">
            {program.map((p) => (
              <div key={p.id} className="grid grid-cols-1 md:grid-cols-[120px_1fr_auto] gap-3 md:gap-7 md:items-center bg-card border border-white/[0.07] rounded-[20px] p-6 md:px-7 md:py-6 hover:border-primary/35 transition-colors">
                <div className="font-heading font-bold text-xl md:text-2xl text-primary">
                  {formatProgramTime(p.time_start)}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-lg md:text-[19px] text-foreground mb-1 line-clamp-2">{p.title}</div>
                  <div className="text-sm text-muted-foreground line-clamp-1">
                    {p.speaker ? `${p.speaker.name}${p.speaker.title ? ` · ${p.speaker.title}` : ""}` : (p.description || "")}
                  </div>
                </div>
                <div className="justify-self-start md:justify-self-end text-xs font-semibold uppercase tracking-wide text-muted-foreground/80 bg-white/[0.05] px-3.5 py-2 rounded-full">
                  {p.speaker ? "Доклад"
                    : /регистрац|сбор|нетворк|welcome/i.test(p.title) ? "Welcome"
                    : /кофе|переры|брейк|пауза/i.test(p.title) ? "Пауза"
                    : /q&a|микрофон|вопрос/i.test(p.title) ? "Q&A"
                    : "Часть"}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SPEAKERS */}
      {speakers.length > 0 && (
        <section id="speakers" className="relative z-[1] max-w-[1240px] mx-auto px-5 md:px-8 py-10 md:py-[72px]">
          <div className="text-[13px] md:text-sm font-bold uppercase tracking-widest text-primary mb-4">Спикеры</div>
          <h2 className="font-heading font-bold tracking-tight text-3xl md:text-5xl text-foreground mb-11">Кто выступает</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {speakers.map((s) => (
              <div key={s.speaker_id} className="bg-card border border-white/[0.07] rounded-[24px] overflow-hidden hover:border-primary/35 hover:-translate-y-1 transition-all duration-300">
                <div className="aspect-[4/5] relative bg-secondary">
                  {s.speaker.photo_url ? (
                    <img src={s.speaker.photo_url} alt={s.speaker.name} className="w-full h-full object-cover object-top" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-heading font-black text-6xl md:text-7xl text-primary/40">
                      {getInitials(s.speaker.name)}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                  {s.speaker.title && (
                    <div className="absolute bottom-4 left-4 right-4 font-heading font-semibold text-[15px] text-primary bg-background/60 backdrop-blur-md px-3 py-1.5 rounded-full inline-block max-w-max">
                      {s.speaker.title}
                    </div>
                  )}
                </div>
                <div className="p-[22px]">
                  <div className="font-heading font-bold text-[22px] text-foreground mb-1">{s.speaker.name}</div>
                  {s.talk_title && <div className="text-primary font-semibold text-sm mb-2.5">{s.talk_title}</div>}
                  <div className="text-[15px] leading-relaxed text-foreground/75">
                    {s.talk_description || s.speaker.description || ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PARTNERS */}
      {sponsors.length > 0 && (() => {
        const generalPartners = sponsors.filter(s => s.effectiveTier === 'general_partner');
        const partners = sponsors.filter(s => s.effectiveTier === 'partner');
        const regular = sponsors.filter(s => s.effectiveTier === 'sponsor');
        return (
          <section className="relative z-[1] max-w-[1240px] mx-auto px-5 md:px-8 py-10 md:py-14">
            <div className="text-[13px] md:text-sm font-bold uppercase tracking-widest text-primary mb-4">Партнёры</div>
            <h2 className="font-heading font-bold tracking-tight text-3xl md:text-5xl text-foreground mb-10">Кто поддерживает</h2>
            <div className="space-y-8">
              {generalPartners.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
                    {generalPartners.length === 1 ? "Генеральный партнёр" : "Генеральные партнёры"}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">
                    {generalPartners.map((s) => (
                      <a key={s.id} href={s.website_url || '#'} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center min-h-[100px] rounded-[20px] border border-primary/30 bg-card hover:border-primary/50 transition-colors p-6">
                        {s.logo_url ? <img src={s.logo_url} alt={s.name} className="max-h-20 max-w-full object-contain" /> : <span className="text-xl font-semibold text-foreground">{s.name}</span>}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {partners.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Партнёры</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {partners.map((s) => (
                      <a key={s.id} href={s.website_url || '#'} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center min-h-[80px] rounded-[18px] border border-white/[0.07] bg-card hover:border-primary/35 transition-colors p-5">
                        {s.logo_url ? <img src={s.logo_url} alt={s.name} className="max-h-14 max-w-full object-contain" /> : <span className="font-semibold text-foreground">{s.name}</span>}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {regular.length > 0 && (
                <div className="flex flex-wrap items-center gap-6">
                  {regular.map((s) => (
                    <a key={s.id} href={s.website_url || '#'} target="_blank" rel="noopener noreferrer" className="group">
                      {s.logo_url
                        ? <img src={s.logo_url} alt={s.name} className="h-12 w-auto object-contain grayscale hover:grayscale-0 transition-all" />
                        : <span className="px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-muted-foreground group-hover:text-primary">{s.name}</span>}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </section>
        );
      })()}

      {/* LOCATION */}
      {(event.location_name || event.location_address) && (
        <section id="location" className="relative z-[1] max-w-[1240px] mx-auto px-5 md:px-8 py-10 md:py-[72px]">
          <div className="rounded-[28px] overflow-hidden border border-white/[0.07] bg-card grid md:grid-cols-[1fr_1.1fr]">
            <div className="p-8 md:p-12">
              <div className="text-[13px] md:text-sm font-bold uppercase tracking-widest text-primary mb-4">Место</div>
              <h2 className="font-heading font-bold tracking-tight text-3xl md:text-[38px] text-foreground mb-5">
                {event.location_name || "Место проведения"}
              </h2>
              {event.location_address && (
                <p className="text-[17px] leading-relaxed text-foreground/80 mb-7 flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  {event.location_address}
                </p>
              )}
              <div className="flex flex-col gap-3.5">
                <div className="flex gap-3 items-center text-[15px] text-foreground/80"><span className="text-primary">—</span> {formatDateFull(event.date)}, сбор с {formatTime(event.date)}</div>
                <div className="flex gap-3 items-center text-[15px] text-foreground/80"><span className="text-primary">—</span> {event.price > 0 ? `${event.price} BYN` : "Бесплатно по регистрации"}</div>
                <div className="flex gap-3 items-center text-[15px] text-foreground/80"><span className="text-primary">—</span> Кофе и общение включены</div>
              </div>
            </div>
            <div className="min-h-[320px] md:min-h-[420px]">
              <EventLocationMap address={event.location_address || undefined} yandexMapUrl={event.yandex_map_url} />
            </div>
          </div>
        </section>
      )}

      {/* REGISTER */}
      <section id="register" className="relative z-[1] max-w-[1240px] mx-auto px-5 md:px-8 py-10 md:py-20">
        <div className="relative rounded-[32px] overflow-hidden border border-primary/25 px-6 py-12 md:p-16 text-center"
          style={{ background: "linear-gradient(160deg, hsl(74 100% 50% / 0.07), hsl(0 0% 8%))" }}>
          <div aria-hidden className="pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 w-[520px] h-[400px] rounded-full"
            style={{ background: "radial-gradient(circle, hsl(var(--primary)/0.16), transparent 65%)" }} />
          <div className="relative max-w-2xl mx-auto">
            <h2 className="font-heading font-black tracking-tight leading-[1] text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
              Забронируй место
            </h2>
            <p className="text-lg text-foreground/80 leading-relaxed mb-8 max-w-xl mx-auto">
              Участие {event.price > 0 ? `— ${event.price} BYN` : "бесплатное"}. Регистрация в Telegram mini-app: подтверждение, билет и напоминание придут прямо в бота.
            </p>
            <button onClick={openBot}
              className="inline-flex items-center gap-2.5 rounded-full bg-primary text-primary-foreground font-bold text-base md:text-lg px-8 md:px-10 py-4 md:py-5 shadow-lime hover:bg-lime-dark hover:-translate-y-0.5 transition-all animate-glow-pulse">
              Зарегистрироваться в Telegram <ArrowRight className="w-5 h-5" />
            </button>
            {regCount !== null && regCount > 0 && (
              <div className="mt-6 text-sm text-muted-foreground">
                <span className="text-foreground font-semibold">{regCount}</span> человек уже зарегистрировались
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative z-[1] max-w-[820px] mx-auto px-5 md:px-8 py-10 md:py-20">
        <h2 className="font-heading font-bold tracking-tight text-3xl md:text-[46px] text-foreground text-center mb-9">Частые вопросы</h2>
        <div className="flex flex-col gap-3">
          {FAQS.map((f, i) => (
            <div key={i} onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
              className="bg-card border border-white/[0.07] rounded-[18px] px-6 py-5 cursor-pointer hover:border-primary/30 transition-colors">
              <div className="flex justify-between items-center gap-4">
                <span className="font-bold text-[17px] text-foreground">{f.q}</span>
                <span className="text-primary text-2xl leading-none flex-shrink-0">{openFaq === i ? "−" : "+"}</span>
              </div>
              {openFaq === i && <div className="text-[15px] leading-relaxed text-muted-foreground mt-3.5">{f.a}</div>}
            </div>
          ))}
        </div>
      </section>

      <Footer />

      {/* scroll to top */}
      {showTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} title="Наверх"
          className="fixed bottom-7 right-7 z-[60] w-[52px] h-[52px] rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lime hover:bg-lime-dark hover:-translate-y-1 transition-all">
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default EventPage;
