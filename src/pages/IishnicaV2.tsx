import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight,
  ArrowUp,
  Briefcase,
  Check,
  ChevronLeft,
  ChevronRight,
  Cpu,
  GraduationCap,
  Phone,
  Rocket,
  Send,
  Sparkles,
  TrendingUp,
  UserCog,
  Users,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { PARTNER_LOGOS } from "@/lib/partners";
import {
  AUDIENCE_SEGMENTS,
  AUDIENCE_STATS,
  COMMUNITY_ABOUT,
  COMMUNITY_GEO,
  GALLERY,
  PARTNER_CONTACT,
  SHOWCASE_SPEAKERS,
  SPEAKER_CARD_BG,
} from "@/lib/community";
import {
  BIG_FORMAT_CAPACITY,
  PARTNER_PACKAGES,
  SEASON_EVENTS,
  SeasonEvent,
  formatSeasonDate,
  formatSeasonWeekday,
  seasonTotals,
} from "@/lib/season";

const BOT_URL = "https://telegram.me/maincomapp_bot";

const SEGMENT_ICONS = {
  briefcase: Briefcase,
  userCog: UserCog,
  trending: TrendingUp,
  cpu: Cpu,
  graduation: GraduationCap,
  rocket: Rocket,
} as const;

/** Заголовок секции: лаймовый eyebrow + крупный H2 с акцентным словом. */
const SectionHead: React.FC<{ eyebrow: string; title: string; accent?: string }> = ({
  eyebrow,
  title,
  accent,
}) => (
  <>
    <div className="text-[13px] md:text-sm font-bold uppercase tracking-widest text-primary mb-4">{eyebrow}</div>
    <h2 className="font-heading font-bold tracking-tight leading-[1.02] text-3xl md:text-5xl text-foreground">
      {title}
      {accent && <span className="text-primary"> {accent}</span>}
    </h2>
  </>
);

/** Слайдшоу с автопрокруткой: точки, стрелки, пауза при наведении. */
const PhotoSlideshow: React.FC<{ photos: typeof COMMUNITY_ABOUT.photos; badge: string }> = ({
  photos,
  badge,
}) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || photos.length < 2) return;
    // уважаем системную настройку «уменьшить движение»
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // index в зависимостях — чтобы после ручного переключения отсчёт начинался заново
    const t = window.setTimeout(() => setIndex((i) => (i + 1) % photos.length), 4200);
    return () => window.clearTimeout(t);
  }, [paused, photos.length, index]);

  const go = (dir: number) => setIndex((i) => (i + dir + photos.length) % photos.length);

  return (
    <div
      className="relative rounded-[26px] overflow-hidden border border-white/[0.08] shadow-card group"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* единая пропорция для всех кадров — снимки и вертикальные, и горизонтальные */}
      <div className="relative aspect-[4/3]">
        {photos.map((p, i) => (
          <img
            key={p.src}
            src={p.src}
            alt={p.alt}
            loading={i === 0 ? "eager" : "lazy"}
            aria-hidden={i !== index}
            style={{ objectPosition: p.position ?? "center" }}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-out ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>

      {/* затемнение под подписями */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/55 to-transparent pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"
      />

      <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-background/60 backdrop-blur-md border border-primary/30 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
        {badge}
      </span>

      <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 text-sm font-medium text-white drop-shadow">
        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
        {photos[index].caption}
      </span>

      {photos.length > 1 && (
        <>
          {/* стрелки — появляются при наведении, на тач-устройствах не нужны */}
          <button
            onClick={() => go(-1)}
            aria-label="Предыдущее фото"
            className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/60 backdrop-blur-md border border-white/[0.14] items-center justify-center text-foreground opacity-0 group-hover:opacity-100 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Следующее фото"
            className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/60 backdrop-blur-md border border-white/[0.14] items-center justify-center text-foreground opacity-0 group-hover:opacity-100 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 right-4 flex items-center gap-1.5">
            {photos.map((p, i) => (
              <button
                key={p.src}
                onClick={() => setIndex(i)}
                aria-label={`Фото ${i + 1} из ${photos.length}`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-6 bg-primary" : "w-1.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

/** Карточка одного ивента сезона. */
const SeasonRow: React.FC<{ event: SeasonEvent; isNext: boolean }> = ({ event, isNext }) => {
  const big = event.capacity >= BIG_FORMAT_CAPACITY;
  const [day, month] = formatSeasonDate(event.date).split(" ");

  return (
    <div
      className={`group relative overflow-hidden rounded-[22px] border p-5 md:p-6 transition-all duration-300 hover:-translate-y-1 ${
        big
          ? "bg-primary/[0.06] border-primary/25 hover:border-primary/50"
          : "bg-white/[0.04] border-white/[0.08] hover:border-primary/40 hover:bg-white/[0.06]"
      }`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-16 w-40 h-40 rounded-full bg-primary/[0.08] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />

      <div className="relative grid gap-5 md:gap-8 md:grid-cols-[132px_1fr_auto] md:items-center">
        {/* дата */}
        <div className="flex items-end gap-3 md:block">
          <div className="font-display font-bold text-5xl md:text-[52px] leading-none text-foreground tabular-nums">
            {day}
          </div>
          <div className="md:mt-2">
            <div className="font-heading font-bold text-base md:text-lg text-primary leading-none">{month}</div>
            <div className="text-xs md:text-[13px] text-muted-foreground mt-1 capitalize">
              {formatSeasonWeekday(event.date)}
            </div>
          </div>
        </div>

        {/* спикеры */}
        <div className="min-w-0">
          {event.speakers.length === 0 ? (
            <div className="flex items-center gap-3 text-muted-foreground">
              <span className="w-10 h-10 rounded-full border border-dashed border-white/[0.16] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 opacity-50" />
              </span>
              <span className="text-sm md:text-base">Спикеры уточняются</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-x-7 gap-y-4">
              {event.speakers.map((s, i) => (
                <div key={i} className="flex items-center gap-3 min-w-0">
                  {s.photo ? (
                    <img
                      src={s.photo}
                      alt={s.name ?? ""}
                      className="w-10 h-10 md:w-11 md:h-11 rounded-full object-cover object-top border border-white/[0.12] shrink-0"
                    />
                  ) : (
                    <span
                      className={`w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center text-xs font-heading font-bold shrink-0 ${
                        s.name
                          ? "bg-primary/15 text-primary border border-primary/25"
                          : "border border-dashed border-white/[0.16] text-muted-foreground/60"
                      }`}
                    >
                      {s.name ? initials(s.name) : "?"}
                    </span>
                  )}
                  <div className="min-w-0">
                    <div
                      className={`font-heading font-semibold text-sm md:text-[15px] leading-tight truncate ${
                        s.name ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {s.name ?? "Спикер уточняется"}
                    </div>
                    {s.org && (
                      <div className="text-xs md:text-[13px] text-muted-foreground mt-0.5 truncate">{s.org}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* вместимость */}
        <div className="flex items-center gap-2 md:justify-end">
          {isNext && (
            <span className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-[0.12em]">
              Ближайший
            </span>
          )}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] md:text-xs font-bold uppercase tracking-[0.1em] whitespace-nowrap ${
              big
                ? "bg-primary/15 text-primary border border-primary/30"
                : "bg-white/[0.06] text-muted-foreground border border-white/[0.1]"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            {event.capacity} мест
          </span>
        </div>
      </div>
    </div>
  );
};

const IishnicaV2: React.FC = () => {
  const [communityCount, setCommunityCount] = useState<number | null>(null);
  const [showTop, setShowTop] = useState(false);

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

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const totals = seasonTotals();
  const today = new Date().setHours(0, 0, 0, 0);
  const nextEvent = SEASON_EVENTS.find((e) => new Date(e.date).getTime() >= today);
  const years = Array.from(new Set(SEASON_EVENTS.map((e) => new Date(e.date).getFullYear())));

  const heroStats = [
    { value: String(totals.events), label: "встреч за сезон" },
    {
      value: communityCount ? communityCount.toLocaleString("ru-RU") : "—",
      label: "в сообществе",
    },
    { value: `≈${AUDIENCE_STATS.decisionMakers}`, label: "руководителей и ЛПР в зале" },
    { value: `≈${AUDIENCE_STATS.costPerContact}`, label: "BYN за один B2B-контакт" },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <Helmet>
        <title>ИИшница — сезон 2026/2027 | M.AI.N Community</title>
        <meta
          name="description"
          content="Расписание митапов ИИшницы на сезон 2026/2027 и партнёрские пакеты Partner и Gold. 10 встреч про искусственный интеллект в Минске."
        />
      </Helmet>

      <Navbar />

      {/* ambient glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-140px] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full z-0"
        style={{ background: "radial-gradient(ellipse at center, hsl(var(--primary)/0.14), transparent 65%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-[1600px] right-[-200px] w-[600px] h-[600px] rounded-full z-0"
        style={{ background: "radial-gradient(circle at center, hsl(var(--primary)/0.07), transparent 65%)" }}
      />

      {/* HERO */}
      <header className="relative z-[1] max-w-[1240px] mx-auto px-5 md:px-8 pt-24 md:pt-32 pb-6 md:pb-10">
        <div className="inline-flex items-center gap-3 mb-6 md:mb-7">
          <span className="px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground text-[11px] md:text-xs font-bold uppercase tracking-[0.12em]">
            Партнёрам · Сезон 2026/2027
          </span>
          <span className="text-muted-foreground text-xs md:text-sm font-semibold uppercase tracking-[0.16em]">
            M.AI.N Community
          </span>
        </div>

        <div className="max-w-[960px]">
          <h1 className="font-heading font-black tracking-tight leading-[0.92] text-5xl sm:text-6xl md:text-7xl lg:text-[92px] mb-5 md:mb-7">
            <span className="text-foreground">Ваш бренд — перед теми, </span>
            <span className="gradient-text">кто принимает решения</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-[640px] mb-8 md:mb-10">
            <span className="text-foreground font-semibold">ИИшница</span> — 10 офлайн-встреч за сезон
            и до {totals.maxCapacity} человек в зале. Почти половина — собственники и руководители,
            которые ищут, с кем внедрять ИИ. Партнёрство — от{" "}
            {PARTNER_PACKAGES[0].price.toLocaleString("ru-RU")} BYN за мероприятие.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <a
              href="#partners"
              className="inline-flex items-center justify-center gap-2.5 rounded-full bg-primary text-primary-foreground font-bold text-base md:text-[17px] px-7 md:px-8 py-4 md:py-[17px] shadow-lime hover:bg-lime-dark hover:-translate-y-0.5 transition-all"
            >
              Смотреть пакеты <ArrowRight className="w-[18px] h-[18px]" />
            </a>
            <a
              href="#events"
              className="inline-flex items-center justify-center gap-2.5 rounded-full border border-white/[0.14] bg-white/[0.04] text-foreground font-semibold text-base md:text-[17px] px-7 md:px-8 py-4 md:py-[17px] hover:bg-white/[0.08] hover:border-primary/40 transition-all"
            >
              Календарь сезона
            </a>
          </div>
        </div>

        {/* статистика сезона */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-12 md:mt-16">
          {heroStats.map((s) => (
            <div
              key={s.label}
              className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-[22px] p-5 md:p-6 hover:border-primary/40 hover:bg-white/[0.06] transition-all duration-300"
            >
              <div className="font-display font-bold text-3xl md:text-[40px] leading-none text-primary tabular-nums">
                {s.value}
              </div>
              <div className="text-[13px] md:text-sm text-muted-foreground mt-3">{s.label}</div>
            </div>
          ))}
        </div>
      </header>

      {/* PARTNERS MARQUEE */}
      <div className="relative z-[1] my-12 md:my-16 border-y border-white/[0.08] py-7 md:py-8 overflow-hidden">
        <div className="text-center text-[11px] md:text-xs uppercase tracking-[0.2em] text-muted-foreground/60 mb-5 md:mb-6">
          Эксперты из топовых компаний
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

      {/* О СООБЩЕСТВЕ */}
      <section id="about" className="relative z-[1] max-w-[1240px] mx-auto px-5 md:px-8 py-10 md:py-16 scroll-mt-24">
        <div className="grid gap-9 md:gap-14 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <div>
            <SectionHead
              eyebrow={COMMUNITY_ABOUT.eyebrow}
              title={COMMUNITY_ABOUT.title}
              accent={COMMUNITY_ABOUT.titleAccent}
            />
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mt-5 md:mt-6 max-w-[560px]">
              {COMMUNITY_ABOUT.text}
            </p>
            <div className="flex flex-wrap gap-2.5 mt-7 md:mt-8">
              {COMMUNITY_ABOUT.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/[0.05] border border-white/[0.1] text-sm font-medium text-foreground"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <PhotoSlideshow photos={COMMUNITY_ABOUT.photos} badge={COMMUNITY_ABOUT.photoBadge} />
        </div>
      </section>

      {/* ГЕОГРАФИЯ */}
      <section className="relative z-[1] max-w-[1240px] mx-auto px-5 md:px-8 py-10 md:py-16">
        <div className="grid gap-9 md:gap-14 lg:grid-cols-[1fr_0.95fr] lg:items-center">
          <div>
            <SectionHead
              eyebrow={COMMUNITY_GEO.eyebrow}
              title={COMMUNITY_GEO.title}
              accent={COMMUNITY_GEO.titleAccent}
            />
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mt-5 md:mt-6 max-w-[520px]">
              {COMMUNITY_GEO.text}
            </p>
            <div className="flex flex-wrap gap-2.5 mt-7 md:mt-8">
              {COMMUNITY_GEO.places.map((p) => (
                <span
                  key={p.label}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/[0.05] border border-white/[0.1] text-sm font-medium text-foreground"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <span aria-hidden>{p.flag}</span>
                  {p.label}
                </span>
              ))}
            </div>
            <div className="font-heading font-black tracking-tight text-primary text-5xl md:text-7xl mt-8 md:mt-10">
              {COMMUNITY_GEO.highlight}
            </div>
          </div>

          <div className="relative rounded-[26px] overflow-hidden border border-white/[0.08] bg-white/[0.02] p-3 md:p-4">
            <img
              src={COMMUNITY_GEO.map}
              alt="Карта присутствия M.AI.N: Беларусь, Москва, Баку"
              loading="lazy"
              className="block w-full h-auto rounded-[16px]"
            />
          </div>
        </div>
      </section>

      {/* КАЛЕНДАРЬ СЕЗОНА */}
      <section id="events" className="relative z-[1] max-w-[1240px] mx-auto px-5 md:px-8 py-10 md:py-16">
        <div className="text-[13px] md:text-sm font-bold uppercase tracking-widest text-primary mb-4">
          Календарь сезона
        </div>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-9 md:mb-12">
          <h2 className="font-heading font-bold tracking-tight leading-[1.02] text-3xl md:text-5xl text-foreground max-w-[640px]">
            Все даты известны заранее
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-[380px]">
            {totals.bigFormat} встречи сезона проходят в большом формате — на {BIG_FORMAT_CAPACITY} участников.
          </p>
        </div>

        {years.map((year) => (
          <div key={year} className="mb-10 md:mb-14 last:mb-0">
            <div className="flex items-center gap-5 mb-5 md:mb-6">
              <span className="font-display font-bold text-2xl md:text-3xl text-muted-foreground/50 tabular-nums">
                {year}
              </span>
              <span className="h-px flex-1 bg-white/[0.08]" />
            </div>
            <div className="space-y-3 md:space-y-4">
              {SEASON_EVENTS.filter((e) => new Date(e.date).getFullYear() === year).map((e) => (
                <SeasonRow key={e.id} event={e} isNext={e.id === nextEvent?.id} />
              ))}
            </div>
          </div>
        ))}

        {/* страница партнёрская, но гостям тоже нужен вход */}
        <p className="text-sm md:text-base text-muted-foreground mt-8 md:mt-10">
          Хотите прийти как гость?{" "}
          <a
            href={BOT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-semibold hover:underline underline-offset-4"
          >
            Регистрация в телеграм-боте
          </a>
        </p>
      </section>

      {/* СПИКЕРЫ ПРОШЛЫХ ВЫПУСКОВ.
          Карточки вырезаны из презентации вместе с фоном, поэтому фон секции
          выставлен в тот же цвет — иначе вокруг них видны швы. */}
      <section
        id="speakers"
        className="relative z-[1] py-14 md:py-20 scroll-mt-24"
        style={{ backgroundColor: SPEAKER_CARD_BG }}
      >
        <div className="max-w-[1240px] mx-auto px-5 md:px-8">
          <SectionHead eyebrow="Спикеры" title="На нашей сцене —" accent="лидеры рынка" />
          <div className="grid gap-4 md:gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-9 md:mt-12">
            {SHOWCASE_SPEAKERS.map((s) => (
              <img
                key={s.name}
                src={s.card}
                alt={`${s.name} — ${s.org}`}
                loading="lazy"
                className="block w-full h-auto hover:-translate-y-1 transition-transform duration-300"
              />
            ))}
          </div>
        </div>
      </section>

      {/* АУДИТОРИЯ */}
      <section className="relative z-[1] max-w-[1240px] mx-auto px-5 md:px-8 py-12 md:py-20">
        <SectionHead eyebrow="Аудитория" title="Кто будет" accent="в зале" />

        <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3 mt-6 md:mt-8">
          {[
            { v: communityCount ? communityCount.toLocaleString("ru-RU") : "—", l: "в сообществе" },
            { v: String(AUDIENCE_STATS.guests), l: "гостей события" },
            { v: `≈${AUDIENCE_STATS.decisionMakers}`, l: "руководителей и ЛПР" },
          ].map((s) => (
            <div key={s.l} className="flex items-baseline gap-2.5">
              <span className="font-heading font-black text-3xl md:text-[40px] text-primary tabular-nums leading-none">
                {s.v}
              </span>
              <span className="text-sm md:text-base text-muted-foreground">{s.l}</span>
            </div>
          ))}
        </div>

        <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-9 md:mt-12">
          {AUDIENCE_SEGMENTS.map((seg) => {
            const Icon = SEGMENT_ICONS[seg.icon as keyof typeof SEGMENT_ICONS];
            return (
              <div
                key={seg.title}
                className="group bg-white/[0.04] border border-white/[0.08] rounded-[22px] p-5 md:p-6 hover:border-primary/40 hover:bg-white/[0.06] hover:-translate-y-1 transition-all duration-300"
              >
                <span className="w-11 h-11 rounded-xl bg-primary/[0.12] border border-primary/25 flex items-center justify-center text-primary mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="w-5 h-5" />
                </span>
                <div className="font-heading font-bold text-base md:text-[17px] text-foreground leading-snug">
                  {seg.title}
                </div>
                <div className="text-[13px] md:text-sm text-muted-foreground mt-2">{seg.sub}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ФОТООТЧЁТ */}
      <section className="relative z-[1] max-w-[1240px] mx-auto px-5 md:px-8 py-10 md:py-16">
        <SectionHead eyebrow="Как это было" title="Атмосфера прошлых" accent="ИИшниц" />

        <div className="grid gap-3 md:gap-4 md:grid-cols-2 mt-9 md:mt-12">
          <div className="relative rounded-[22px] overflow-hidden border border-white/[0.08]">
            <img
              src={GALLERY[0].src}
              alt={GALLERY[0].alt}
              loading="lazy"
              className="block w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {GALLERY.slice(1).map((g) => (
              <div key={g.src} className="relative rounded-[18px] overflow-hidden border border-white/[0.08]">
                <img src={g.src} alt={g.alt} loading="lazy" className="block w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ПАРТНЁРСКИЕ ПАКЕТЫ */}
      <section id="partners" className="relative z-[1] max-w-[1240px] mx-auto px-5 md:px-8 py-10 md:py-16 scroll-mt-24">
        <div className="text-[13px] md:text-sm font-bold uppercase tracking-widest text-primary mb-4">Партнёрам</div>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-9 md:mb-12">
          <h2 className="font-heading font-bold tracking-tight leading-[1.02] text-3xl md:text-5xl text-foreground max-w-[640px]">
            Два пакета участия
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-[380px]">
            Стоимость указана за одно мероприятие. Пакет на сезон — обсуждаем отдельно.
          </p>
        </div>

        <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
          {PARTNER_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative overflow-hidden rounded-[26px] border p-6 md:p-9 h-full flex flex-col ${
                pkg.featured
                  ? "bg-primary/[0.06] border-primary/30 shadow-lime"
                  : "bg-white/[0.04] border-white/[0.08]"
              }`}
            >
              {pkg.featured && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-24 -right-24 w-56 h-56 rounded-full bg-primary/[0.12] blur-3xl"
                />
              )}

              <div className="relative flex items-start justify-between gap-4 mb-6">
                <div>
                  <div className="font-heading font-black text-2xl md:text-3xl text-foreground">{pkg.name}</div>
                  <p className="text-sm md:text-[15px] text-muted-foreground mt-2 max-w-[300px] leading-relaxed">
                    {pkg.tagline}
                  </p>
                </div>
                {pkg.featured && (
                  <span className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-[0.12em] whitespace-nowrap">
                    Максимум
                  </span>
                )}
              </div>

              <div className="relative flex items-baseline gap-2 mb-7 md:mb-8">
                <span
                  className={`font-display font-bold text-4xl md:text-[52px] leading-none tabular-nums ${
                    pkg.featured ? "text-primary" : "text-foreground"
                  }`}
                >
                  {pkg.price.toLocaleString("ru-RU")}
                </span>
                <span className="text-sm md:text-base font-semibold text-muted-foreground uppercase tracking-wide">
                  {pkg.currency}
                </span>
              </div>

              <ul className="relative space-y-3 md:space-y-3.5">
                {pkg.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-3">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-white/[0.06] border border-white/[0.1] flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-muted-foreground" />
                    </span>
                    <span className="text-sm md:text-[15px] text-muted-foreground leading-relaxed">{perk}</span>
                  </li>
                ))}
              </ul>

              {pkg.extraPerks && (
                <>
                  <div className="relative flex items-center gap-4 my-6">
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary whitespace-nowrap">
                      И сверх того
                    </span>
                    <span className="h-px flex-1 bg-primary/20" />
                  </div>
                  <ul className="relative space-y-3 md:space-y-3.5">
                    {pkg.extraPerks.map((perk) => (
                      <li key={perk} className="flex items-start gap-3">
                        <span className="mt-0.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
                        </span>
                        <span className="text-sm md:text-[15px] text-foreground leading-relaxed">{perk}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* mt-auto прижимает кнопку к низу — карточки в ряду одной высоты */}
              <div className="relative mt-auto pt-8 md:pt-10">
                <a
                  href={`https://t.me/${PARTNER_CONTACT.telegram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full inline-flex items-center justify-center gap-2.5 rounded-full font-bold text-base px-7 py-4 transition-all hover:-translate-y-0.5 ${
                    pkg.featured
                      ? "bg-primary text-primary-foreground hover:bg-lime-dark shadow-lime"
                      : "border border-white/[0.14] bg-white/[0.04] text-foreground hover:bg-white/[0.08] hover:border-primary/40"
                  }`}
                >
                  Обсудить пакет <ArrowRight className="w-[18px] h-[18px]" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* КОНТАКТЫ */}
      <section id="register" className="relative z-[1] max-w-[1240px] mx-auto px-5 md:px-8 py-10 md:py-20">
        <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.04] p-6 md:p-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 left-1/4 w-[500px] h-[300px] rounded-full"
            style={{ background: "radial-gradient(ellipse at center, hsl(var(--primary)/0.16), transparent 70%)" }}
          />

          <div className="relative">
            <SectionHead eyebrow="Контакты" title="Обсудим" accent="партнёрство" />
          </div>

          <div className="relative grid gap-7 md:gap-12 md:grid-cols-[240px_1fr] md:items-center mt-8 md:mt-10">
            <img
              src={PARTNER_CONTACT.photo}
              alt={PARTNER_CONTACT.name}
              loading="lazy"
              className="w-40 md:w-full h-auto rounded-[22px] border border-white/[0.08] object-cover"
            />

            <div>
              <div className="font-heading font-black text-2xl md:text-4xl text-foreground">
                {PARTNER_CONTACT.name}
              </div>
              <p className="text-sm md:text-base text-muted-foreground mt-2 md:mt-3 max-w-[420px] leading-relaxed">
                {PARTNER_CONTACT.role}
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 mt-7 md:mt-8">
                <a
                  href={`https://t.me/${PARTNER_CONTACT.telegram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 rounded-full bg-primary text-primary-foreground font-bold text-base px-7 py-4 shadow-lime hover:bg-lime-dark hover:-translate-y-0.5 transition-all"
                >
                  <Send className="w-[18px] h-[18px]" /> @{PARTNER_CONTACT.telegram}
                </a>
                <a
                  href={`tel:${PARTNER_CONTACT.phone.replace(/[^+\d]/g, "")}`}
                  className="inline-flex items-center justify-center gap-2.5 rounded-full border border-white/[0.14] bg-white/[0.04] text-foreground font-semibold text-base px-7 py-4 hover:bg-white/[0.08] hover:border-primary/40 transition-all"
                >
                  <Phone className="w-[18px] h-[18px]" /> {PARTNER_CONTACT.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* кнопка наверх */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Наверх"
        className={`fixed bottom-5 right-5 z-40 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lime flex items-center justify-center transition-all md:hidden ${
          showTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
        }`}
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </div>
  );
};

export default IishnicaV2;
