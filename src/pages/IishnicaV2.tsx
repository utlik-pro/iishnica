import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { ArrowRight, ArrowUp, Check, Mail, Phone, Sparkles, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { PARTNER_LOGOS } from "@/lib/partners";
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
const CONTACT_EMAIL = "admin@utlik.pro";
const CONTACT_PHONE = "+375 44 755 4000";

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
    { value: String(totals.events), label: "митапов в сезоне" },
    {
      value: communityCount ? communityCount.toLocaleString("ru-RU") : "—",
      label: "в комьюнити",
    },
    { value: String(totals.maxCapacity), label: "максимум участников в зале" },
    { value: String(totals.bigFormat), label: "встречи в большом формате" },
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
            Сезон 2026/2027
          </span>
          <span className="text-muted-foreground text-xs md:text-sm font-semibold uppercase tracking-[0.16em]">
            M.AI.N Community
          </span>
        </div>

        <div className="max-w-[900px]">
          <h1 className="font-heading font-black tracking-tight leading-[0.92] text-6xl sm:text-7xl md:text-8xl lg:text-[120px] mb-5 md:mb-6">
            <span className="gradient-text">ИИшница</span>
            <span className="block text-foreground text-[0.55em] leading-[1.05] mt-2 md:mt-4">
              весь сезон целиком
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-[620px] mb-8 md:mb-10">
            Десять встреч про искусственный интеллект — от практики внедрения в крупных компаниях
            до опыта стартапов Кремниевой долины. Минск, офлайн, участие бесплатное.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <button
              onClick={() => window.open(BOT_URL, "_blank")}
              className="inline-flex items-center justify-center gap-2.5 rounded-full bg-primary text-primary-foreground font-bold text-base md:text-[17px] px-7 md:px-8 py-4 md:py-[17px] shadow-lime hover:bg-lime-dark hover:-translate-y-0.5 transition-all"
            >
              Зарегистрироваться <ArrowRight className="w-[18px] h-[18px]" />
            </button>
            <a
              href="#partners"
              className="inline-flex items-center justify-center gap-2.5 rounded-full border border-white/[0.14] bg-white/[0.04] text-foreground font-semibold text-base md:text-[17px] px-7 md:px-8 py-4 md:py-[17px] hover:bg-white/[0.08] hover:border-primary/40 transition-all"
            >
              Стать партнёром
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
                  href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
                    `Партнёрский пакет «${pkg.name}» — ИИшница 2026/2027`
                  )}`}
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
        <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.04] p-7 md:p-14 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full"
            style={{ background: "radial-gradient(ellipse at center, hsl(var(--primary)/0.16), transparent 70%)" }}
          />
          <h2 className="relative font-heading font-bold tracking-tight leading-[1.05] text-3xl md:text-5xl text-foreground mb-4 md:mb-5">
            Обсудим участие в сезоне?
          </h2>
          <p className="relative text-base md:text-lg text-muted-foreground max-w-[560px] mx-auto mb-8 md:mb-10">
            Расскажем про аудиторию каждого мероприятия и подберём формат под ваши задачи.
          </p>
          <div className="relative flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full bg-primary text-primary-foreground font-bold text-base px-7 py-4 shadow-lime hover:bg-lime-dark hover:-translate-y-0.5 transition-all"
            >
              <Mail className="w-[18px] h-[18px]" /> {CONTACT_EMAIL}
            </a>
            <a
              href={`tel:${CONTACT_PHONE.replace(/[^+\d]/g, "")}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full border border-white/[0.14] bg-white/[0.04] text-foreground font-semibold text-base px-7 py-4 hover:bg-white/[0.08] hover:border-primary/40 transition-all"
            >
              <Phone className="w-[18px] h-[18px]" /> {CONTACT_PHONE}
            </a>
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
