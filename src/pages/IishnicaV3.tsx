/**
 * Третья, отдельная версия лендинга ИИшницы — маршрут /v3.
 *
 * Визуальный язык взят с референса voltlites.com: чёрный холст, кислотный
 * лайм единственным акцентом, моноширинные капсы, огромный вордмарк,
 * который на скролле уезжает из нижнего угла в верхний, sticky-сцены и
 * «веер» из полос между блоками.
 *
 * Контент — тот же, что у /v2 (src/lib/season.ts, src/lib/community.ts):
 * сезон 2026/2027, спикеры, аудитория, фотоотчёт, партнёрские пакеты.
 *
 * Версии «/» и «/v2» эта страница не трогает: вся вёрстка и все стили
 * заскоуплены под класс `.v3` (src/styles/v3.css).
 */

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { ArrowUpRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PARTNER_LOGOS } from "@/lib/partners";
import { trackEvent } from "@/lib/analytics";
import {
  AUDIENCE_SEGMENTS,
  AUDIENCE_STATS,
  COMMUNITY_ABOUT,
  COMMUNITY_GEO,
  GALLERY,
  PARTNER_CONTACT,
  SHOWCASE_SPEAKERS,
  SOCIAL_LINKS,
  TESTIMONIALS,
  INSTAGRAM_FOLLOWERS,
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
import "@/styles/v3.css";

/** Домен прода — краулерам соцсетей нужен абсолютный адрес картинки. */
const SITE_URL = "https://iishnica.utlik.co";

const OG = {
  url: `${SITE_URL}/v3`,
  image: `${SITE_URL}/v3/og-partners.jpg`,
  title: "Партнёрство с ИИшницей — сезон 2026/2027",
  description:
    "Ваш бренд — перед 235 собственниками и руководителями за один вечер. " +
    "10 офлайн-встреч за сезон, до 800 человек в зале. Пакеты от 2 000 BYN.",
};

const BOT_URL = "https://telegram.me/maincomapp_bot";
const TG_URL = `https://t.me/${PARTNER_CONTACT.telegram}`;

/* ------------------------------------------------------------------ */
/* Хуки анимации                                                       */
/* ------------------------------------------------------------------ */

const reduceMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Скраб: пишет в CSS-переменную прогресс 0→1.
 *
 * mode "pin"   — для высоких обёрток со sticky-содержимым: сколько от
 *                обёртки уже прокручено сверху.
 * mode "cover" — путь верхней кромки блока от низа экрана до верха.
 *                К моменту, когда блок занял экран, прогресс уже 1.
 *
 * `varName` можно писать не в сам элемент, а в переданный target —
 * так прогресс героя попадает в корень страницы и виден всем потомкам.
 */
function useScrub<T extends HTMLElement>(
  varName: string,
  mode: "pin" | "cover" = "pin",
  target?: React.RefObject<HTMLElement>
) {
  const ref = useRef<T>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const write = (v: number) => (target?.current ?? el).style.setProperty(varName, String(v));

    if (reduceMotion()) {
      write(1);
      return;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const span = mode === "pin" ? r.height - vh : vh;
      const passed = mode === "pin" ? -r.top : vh - r.top;
      write(span > 0 ? Math.min(1, Math.max(0, passed / span)) : 0);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [varName, mode, target]);

  return ref;
}

/** Одноразовое появление: вешает `.is-in` на всё с [data-reveal] внутри корня. */
function useReveal(root: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const host = root.current;
    if (!host) return;
    const nodes = Array.from(host.querySelectorAll<HTMLElement>("[data-reveal]"));

    if (reduceMotion()) {
      nodes.forEach((n) => n.classList.add("is-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [root]);
}

/* ------------------------------------------------------------------ */
/* Примитивы                                                           */
/* ------------------------------------------------------------------ */

/** Инициалы — подставляются вместо фото в карточке отзыва, если фото нет. */
const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();

/**
 * Три бегущих ряда логотипов.
 *
 * В каждом ряду — весь набор, но со сдвигом начала: так ряды выглядят
 * по-разному, а повтор одного бренда не попадает в кадр дважды. Если делить
 * набор на три части, ряды получаются короткими и на широком экране рядом
 * видны две копии одного логотипа.
 */
const logoRows = [0, 1, 2].map((r) => {
  const shift = Math.round((PARTNER_LOGOS.length / 3) * r);
  return [...PARTNER_LOGOS.slice(shift), ...PARTNER_LOGOS.slice(0, shift)];
});

/** Детерминированные задержки для ячеек «color-grid» внутри кнопки. */
const GRID_CELLS = Array.from({ length: 36 }, (_, i) => ((i * 37) % 11) * 22);

type BtnProps = {
  label: string;
  href?: string;
  onClick?: () => void;
  external?: boolean;
  className?: string;
  icon?: React.ReactNode;
  /** имя события аналитики; без него клик не трекается */
  event?: string;
  eventParams?: Record<string, string | number | boolean | undefined>;
};

/**
 * Кнопка-пилюля из референса: моно-капс, заливка сеткой и подмена лейбла.
 *
 * Цвет не выбирается вручную — он берётся от поверхности: на тёмном фоне
 * пилюля лаймовая, внутри блока с классом `v3-surface-lime` — чёрная.
 */
const Btn: React.FC<BtnProps> = ({
  label,
  href,
  onClick,
  external,
  className = "",
  icon,
  event,
  eventParams,
}) => {
  const handleClick = () => {
    if (event) trackEvent(event, { placement: label, ...eventParams });
    onClick?.();
  };

  const inner = (
    <>
      <span className="v3-btn-bg" aria-hidden>
        <span className="v3-btn-grid">
          {GRID_CELLS.map((d, i) => (
            <i key={i} style={{ "--d": `${d}ms` } as React.CSSProperties} />
          ))}
        </span>
      </span>
      <span className="v3-btn-label v3-mono">
        <span className="v3-swap" data-hover={label}>
          <i>{label}</i>
        </span>
        {icon ?? <ArrowUpRight className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />}
      </span>
    </>
  );

  const cls = `v3-btn ${className}`;

  if (href) {
    return (
      <a
        href={href}
        className={cls}
        onClick={handleClick}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {inner}
      </a>
    );
  }
  return (
    <button type="button" onClick={handleClick} className={cls}>
      {inner}
    </button>
  );
};

/** Курсор-рамка с mix-blend-difference — только для мыши. */
const Cursor: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches || reduceMotion()) return;
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let x = 0;
    let y = 0;
    const move = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
          el.classList.add("is-on");
        });
      }
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => {
      window.removeEventListener("mousemove", move);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="v3-cursor" aria-hidden>
      <svg viewBox="0 0 34 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M8.5 23.8V24.8H0V18.5H1V23.8H8.5ZM32.9 23.8H25.4V24.8H33.9V18.5H32.9V23.8ZM1 1H8.5V0H0V6.3H1V1ZM32.9 1V6.3H33.9V0H25.4V1H32.9ZM16.4 17.4V24.3H17.5V17.4H16.4ZM17.5 7.4V0.5H16.4V7.4H17.5ZM22 12.4V12.9H28.8V11.9H22V12.4ZM12 11.9H5.1V12.9H12V11.9ZM17 15.9C18.9 15.9 20.4 14.3 20.4 12.4C20.4 10.5 18.9 9 17 9C15.1 9 13.5 10.5 13.5 12.4C13.5 14.3 15.1 15.9 17 15.9Z"
          fill="white"
        />
      </svg>
    </div>
  );
};

/** Заставка: полоски лайма уезжают вверх и открывают страницу. */
const Loader: React.FC = () => {
  const [state, setState] = useState<"in" | "out" | "gone">("in");

  useEffect(() => {
    if (reduceMotion()) {
      setState("gone");
      return;
    }
    const a = window.setTimeout(() => setState("out"), 260);
    const b = window.setTimeout(() => setState("gone"), 1500);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, []);

  if (state === "gone") return null;

  return (
    <div className={`v3-loader ${state === "out" ? "is-done" : ""}`} aria-hidden>
      {Array.from({ length: 8 }, (_, i) => (
        <i key={i} style={{ "--d": `${i * 55}ms` } as React.CSSProperties} />
      ))}
    </div>
  );
};

/** Служебная подпись над блоком: «01 —— Календарь». */
const Eyebrow: React.FC<{ num: string; children: React.ReactNode }> = ({ num, children }) => (
  <div className="v3-mono text-[11px] flex items-center gap-3 text-[#c8ff00]">
    <span className="tabular-nums">{num}</span>
    <span className="h-px w-8 bg-current opacity-40" />
    <span>{children}</span>
  </div>
);

/* ------------------------------------------------------------------ */
/* Данные, специфичные для этой версии                                 */
/* ------------------------------------------------------------------ */

/**
 * Пять «форматов» — аналог нумерованных плиток услуг у референса.
 * `bar` — чуть иной оттенок под подпись, чтобы плашка читалась на плитке.
 */
const FORMATS = [
  {
    n: "01",
    title: "Офлайн-встречи",
    note: "10 за сезон",
    photo: "/v2/photos/hall-seats.webp",
    href: "#season",
    bg: "var(--v3-g1)",
    bar: "#dcff4d",
    fg: "#000",
  },
  {
    n: "02",
    title: "Большая ИИшница",
    note: `${BIG_FORMAT_CAPACITY} мест`,
    photo: "/v2/photos/hall-full.webp",
    href: "#season",
    bg: "var(--v3-g2)",
    bar: "#7cbd4a",
    fg: "#fff",
  },
  {
    n: "03",
    title: "Доклады практиков",
    note: "Кейсы, а не теория",
    photo: "/v2/photos/talk-screen.webp",
    href: "#speakers",
    bg: "var(--v3-g3)",
    bar: "#2c6b2a",
    fg: "#fff",
  },
  {
    n: "04",
    title: "Нетворкинг ЛПР",
    note: `≈${AUDIENCE_STATS.decisionMakers} в зале`,
    photo: "/v2/photos/networking.webp",
    href: "#audience",
    bg: "var(--v3-g4)",
    bar: "#1f6527",
    fg: "#fff",
  },
  {
    n: "05",
    title: "Партнёрство",
    note: `от ${PARTNER_PACKAGES[0].price.toLocaleString("ru-RU")} BYN`,
    photo: "/v2/photos/brandwall-partners.webp",
    href: "#packages",
    bg: "var(--v3-g5)",
    bar: "#0c361d",
    fg: "#fff",
  },
];

/** Имя контакта разбиваем по первому пробелу — в карточке оно идёт в две строки. */
const [contactFirstName, ...contactRest] = PARTNER_CONTACT.name.split(" ");
const contactLastName = contactRest.join(" ");

const MENU_LINKS = [
  { label: "Аудитория", href: "#audience" },
  { label: "Партнёрам", href: "#packages" },
  { label: "Форматы", href: "#formats" },
  { label: "Сезон 2026/2027", href: "#season" },
  { label: "Спикеры", href: "#speakers" },
  { label: "Фотоотчёт", href: "#gallery" },
  { label: "Контакты", href: "#contact" },
];

/* ------------------------------------------------------------------ */
/* Лайтбокс фотоотчёта                                                 */
/* ------------------------------------------------------------------ */

const Lightbox: React.FC<{ index: number; onClose: () => void; onNav: (d: number) => void }> = ({
  index,
  onClose,
  onNav,
}) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNav(1);
      if (e.key === "ArrowLeft") onNav(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, onNav]);

  const photo = GALLERY[index];

  return (
    <div
      className="fixed inset-0 z-[95] bg-black/95 flex items-center justify-center p-4 md:p-12"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={photo.alt}
    >
      <button
        onClick={onClose}
        aria-label="Закрыть"
        className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 border border-white/20 flex items-center justify-center text-white hover:bg-[#c8ff00] hover:text-black hover:border-[#c8ff00] transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onNav(-1);
        }}
        aria-label="Предыдущее фото"
        className="absolute left-3 md:left-6 w-10 h-10 border border-white/20 flex items-center justify-center text-white hover:bg-[#c8ff00] hover:text-black hover:border-[#c8ff00] transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onNav(1);
        }}
        aria-label="Следующее фото"
        className="absolute right-3 md:right-6 w-10 h-10 border border-white/20 flex items-center justify-center text-white hover:bg-[#c8ff00] hover:text-black hover:border-[#c8ff00] transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      <figure className="flex flex-col items-center gap-5" onClick={(e) => e.stopPropagation()}>
        <img src={photo.src} alt={photo.alt} className="max-h-[76vh] w-auto max-w-full object-contain" />
        <figcaption className="v3-mono text-[11px] text-white/60 flex items-center gap-3">
          <span className="text-[#c8ff00]">{photo.caption ?? photo.alt}</span>
          <span className="h-px w-8 bg-white/25" />
          <span className="tabular-nums">
            {String(index + 1).padStart(2, "0")} / {GALLERY.length}
          </span>
        </figcaption>
      </figure>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Страница                                                            */
/* ------------------------------------------------------------------ */

const IishnicaV3: React.FC = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useScrub<HTMLDivElement>("--hero-p", "pin", rootRef);
  const fanRef = useScrub<HTMLDivElement>("--p", "cover");
  const ctaRef = useScrub<HTMLDivElement>("--p", "pin");

  const [menuOpen, setMenuOpen] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [communityCount, setCommunityCount] = useState<number | null>(null);
  const [chatMembers, setChatMembers] = useState<number | null>(null);
  const [hoverRow, setHoverRow] = useState(0);
  const [atFooter, setAtFooter] = useState(false);
  const [galleryExpanded, setGalleryExpanded] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);

  useReveal(rootRef);

  // Считаем через RPC: bot_users закрыта от anon (там персданные), поэтому
  // размер сообщества отдаёт SECURITY DEFINER функция одним числом.
  useEffect(() => {
    (async () => {
      const [{ data, error }, chatRes] = await Promise.all([
        supabase.rpc("community_size"),
        // размер чата лежит в app_settings и доступен анониму — берём его,
        // чтобы показать охват в разбивке по каналам, а не одной суммой
        supabase.from("app_settings").select("value").eq("key", "community_chat_members").maybeSingle(),
      ]);
      if (!error && typeof data === "number") setCommunityCount(data);
      const chat = Number(chatRes.data?.value);
      if (Number.isFinite(chat) && chat > 0) setChatMembers(chat);
    })();
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  /* Ключевая метрика воронки: сколько людей вообще доскроллило до цен.
     Без неё непонятно, кнопку не жмут или до неё просто не доходят. */
  useEffect(() => {
    const el = document.getElementById("packages");
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          trackEvent("PackagesViewed", { content_name: "packages" });
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // у футера прячем плавающий вордмарк — там свой большой логотип
  useEffect(() => {
    const el = document.getElementById("v3-footer");
    if (!el) return;
    const io = new IntersectionObserver((e) => setAtFooter(e[0].isIntersecting), { threshold: 0.02 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const jump = useCallback((href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "start" });
  }, []);

  const totals = seasonTotals();
  const today = new Date().setHours(0, 0, 0, 0);
  const nextEvent = SEASON_EVENTS.find((e) => new Date(e.date).getTime() >= today);

  /* превью для строк сезона — кадры с прошедших встреч */
  const rowPreviews = GALLERY.filter((g) => !g.wide).slice(0, SEASON_EVENTS.length);

  /* Разбивка охвата по каналам. Мини-апп = общий счётчик минус чат: RPC
     отдаёт только сумму, а размер чата лежит отдельно в app_settings.
     Показываем лишь то, что реально посчиталось — без прочерков. */
  const miniapp = communityCount && chatMembers ? communityCount - chatMembers : null;
  const reachChannels = [
    ...(miniapp && miniapp > 0 ? [{ label: "в мини-аппе и боте", value: miniapp }] : []),
    ...(chatMembers ? [{ label: "в телеграм-чате", value: chatMembers }] : []),
    { label: "в instagram", value: INSTAGRAM_FOLLOWERS },
  ];
  const reachTotal = reachChannels.reduce((sum, c) => sum + c.value, 0);

  /* Нумерация подписей 01, 02… считается от фактического набора секций:
     блок отзывов появляется, только когда отзывы есть, и дырки в счёте быть не должно. */
  const sectionNum = Object.fromEntries(
    ["audience", "packages", ...(TESTIMONIALS.length ? ["testimonials"] : []), "season", "speakers", "gallery"].map(
      (key, i) => [key, String(i + 1).padStart(2, "0")]
    )
  ) as Record<string, string>;

  /* пункт «Отзывы» в меню — тоже только когда блок реально есть */
  const menuLinks = TESTIMONIALS.length
    ? [...MENU_LINKS.slice(0, 2), { label: "Отзывы", href: "#testimonials" }, ...MENU_LINKS.slice(2)]
    : MENU_LINKS;

  /* на узком экране мозаика урезана до 9 кадров, остальные — по кнопке */
  const visibleGallery = isNarrow && !galleryExpanded ? GALLERY.slice(0, 9) : GALLERY;

  return (
    <div ref={rootRef} className="v3 min-h-screen overflow-x-clip">
      {/* Заголовок и описание — под аватара страницы (партнёр), а не общие
          «про сообщество»: ссылку чаще всего шлют именно ему в личку. */}
      <Helmet>
        <title>{OG.title}</title>
        <meta name="description" content={OG.description} />
        <link rel="canonical" href={OG.url} />

        <meta property="og:type" content="website" />
        <meta property="og:locale" content="ru_RU" />
        <meta property="og:site_name" content="ИИшница · M.AI.N Community" />
        <meta property="og:url" content={OG.url} />
        <meta property="og:title" content={OG.title} />
        <meta property="og:description" content={OG.description} />
        {/* абсолютный URL обязателен: по относительному пути превью не соберётся */}
        <meta property="og:image" content={OG.image} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={OG.title} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={OG.title} />
        <meta name="twitter:description" content={OG.description} />
        <meta name="twitter:image" content={OG.image} />
      </Helmet>

      <Loader />
      <Cursor />

      {/* Затемнение под шапкой: вордмарк и кнопка меню висят поверх контента,
          и на светлых кадрах и лаймовых плитках они переставали читаться.
          Появляется вместе с уходом героя. */}
      <div
        aria-hidden
        className="fixed top-0 left-0 right-0 z-[44] pointer-events-none bg-gradient-to-b from-black via-black/60 to-transparent"
        style={{
          height: "calc(var(--v3-nav) + 24px)",
          opacity: "calc(var(--hero-p, 0) * 1.4)",
        }}
      />

      {/* ---------------- плавающий вордмарк ---------------- */}
      <div className="v3-wordmark-layer" data-hidden={atFooter}>
        <div className="v3-wordmark-spacer" />
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: reduceMotion() ? "auto" : "smooth" });
          }}
          className="v3-wordmark v3-display"
          aria-label="ИИшница — наверх"
        >
          ИИШНИЦА
        </a>
      </div>

      {/* ---------------- кнопка меню ----------------
          Когда панель открыта, она выезжает прямо под эту кнопку — значит
          поверхность под ней становится лаймовой, и пилюля должна перевернуться
          в чёрную, иначе сольётся с панелью. */}
      <div
        className={`fixed top-0 left-0 right-0 z-[55] v3-container flex justify-end items-center pointer-events-none ${
          menuOpen ? "v3-surface-lime" : ""
        }`}
        style={{ height: "var(--v3-nav)" }}
      >
        <Btn
          label={menuOpen ? "ЗАКРЫТЬ" : "МЕНЮ"}
          onClick={() => setMenuOpen((v) => !v)}
          className="pointer-events-auto"
          icon={
            <svg width="12" height="12" viewBox="0 0 13 13" fill="none" aria-hidden>
              <line x1="6.37" y1="0" x2="6.37" y2="13" stroke="currentColor" strokeWidth="1" />
              <line x1="0" y1="6.63" x2="13" y2="6.63" stroke="currentColor" strokeWidth="1" />
            </svg>
          }
        />
      </div>

      {/* ---------------- панель меню ---------------- */}
      <div
        className={`fixed inset-0 z-[50] transition-opacity duration-300 ${
          menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-black/60" onClick={() => setMenuOpen(false)} />
        <nav
          className={`v3-menu-panel absolute right-0 top-0 h-full w-full sm:w-[420px] bg-[#c8ff00] text-black flex flex-col justify-between p-6 md:p-8 ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          style={{ paddingTop: "calc(var(--v3-nav) + 8px)" }}
          aria-label="Навигация"
        >
          <ul className="flex flex-col border-t border-black/15">
            {menuLinks.map((l, i) => (
              <li key={l.href} className="border-b border-black/15">
                {/* py даёт строке ~56px — комфортная зона для пальца;
                    номер вынесен в свою колонку, раньше он висел на align-super
                    и лез в предыдущую строку */}
                <a
                  href={l.href}
                  onClick={(e) => {
                    e.preventDefault();
                    jump(l.href);
                  }}
                  className="flex items-center gap-4 py-3.5 hover:opacity-60 active:opacity-50 transition-opacity"
                >
                  <span className="v3-mono text-[11px] opacity-45 tabular-nums w-6 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="v3-display v3-menu-item text-[28px] sm:text-[30px]">{l.label}</span>
                </a>
              </li>
            ))}
          </ul>

          <div className="pt-6">
            <div className="v3-mono text-[10px] opacity-45 mb-1">Соцсети</div>
            <ul className="flex flex-col">
              {SOCIAL_LINKS.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="v3-mono text-[13px] flex items-center justify-between gap-4 py-2.5 hover:opacity-60 active:opacity-50 transition-opacity"
                  >
                    {s.label}
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-50 shrink-0" strokeWidth={1.5} />
                  </a>
                </li>
              ))}
            </ul>

            <div className="border-t border-black/20 mt-4 pt-4 flex flex-col">
              <a
                href={BOT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="v3-mono text-[12px] flex items-center justify-between gap-4 py-2 hover:opacity-60 active:opacity-50 transition-opacity"
              >
                Регистрация в телеграм-боте
                <ArrowUpRight className="w-3.5 h-3.5 opacity-50 shrink-0" strokeWidth={1.5} />
              </a>
              <a
                href={TG_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="v3-mono text-[12px] flex items-center justify-between gap-4 py-2 hover:opacity-60 active:opacity-50 transition-opacity"
              >
                По партнёрству — @{PARTNER_CONTACT.telegram}
                <ArrowUpRight className="w-3.5 h-3.5 opacity-50 shrink-0" strokeWidth={1.5} />
              </a>
              <a
                href="/"
                className="v3-mono text-[12px] py-2 opacity-60 hover:opacity-100 transition-opacity"
              >
                Основная версия сайта
              </a>
            </div>
          </div>
        </nav>
      </div>

      {/* ================= ГЕРОЙ ================= */}
      {/* Высота обёртки задаёт длину скролл-сцены героя: скраб идёт по
          (высота − экран), то есть на мобиле все три кадра сменяются за 70vh.
          На 50vh кадры мелькали слишком быстро. */}
      <div id="top" ref={heroRef} className="relative bg-black md:min-h-[280vh] min-h-[170vh]">
        <section className="h-screen sticky top-0 overflow-hidden">
          <div className="v3-hero-stage">
            <div className="v3-hero-plate" data-plate="1">
              <img src="/v2/photos/hall-full.webp" alt="Полный зал на Вечерней ИИшнице" />
            </div>
            <div className="v3-hero-plate" data-plate="2">
              <img src="/v2/photos/talk-screen.webp" alt="Доклад на ИИшнице" loading="lazy" />
            </div>
            <div className="v3-hero-plate" data-plate="3">
              <img src="/v2/photos/venue-red.webp" alt="Площадка ИИшницы" loading="lazy" />
            </div>
          </div>
          <span className="v3-noise" aria-hidden />

          {/* Первый экран продаёт партнёрство, а не рассказывает о сообществе:
              что предлагаем, кому и почём — плюс кнопка сразу к пакетам. */}
          <div className="absolute inset-0 flex items-center justify-center v3-container">
            <div className="text-center -translate-y-[6vh] md:translate-y-0 max-w-[30ch]">
              <p className="v3-mono text-[10px] md:text-[11px] text-[#c8ff00]">Партнёрам · сезон 2026/2027</p>
              <p className="text-white text-[19px] sm:text-xl md:text-2xl leading-snug mt-4">
                Ваш бренд — перед {AUDIENCE_STATS.decisionMakers} собственниками и руководителями
                за один вечер. {totals.events} встреч за сезон, до {totals.maxCapacity} человек
                в зале.
              </p>
              <div className="flex justify-center mt-7">
                <Btn
                  label={`ПАКЕТЫ ОТ ${PARTNER_PACKAGES[0].price.toLocaleString("ru-RU")} BYN`}
                  onClick={() => jump("#packages")}
                  event="ViewContent"
                  eventParams={{ content_name: "packages", source: "hero" }}
                />
              </div>
            </div>
          </div>

          {/* слоган — правый нижний угол. На узких экранах поднимаем над
              вордмарком, иначе они накладываются друг на друга */}
          <div className="absolute bottom-0 right-0 v3-container pb-[104px] sm:pb-[18px] pointer-events-none">
            <div className="v3-tagline v3-display v3-normal text-right max-w-[13ch]">
              <span className="text-white/45">Первое</span>{" "}
              <span className="text-white">AI-сообщество Беларуси</span>
            </div>
          </div>

          {/* подсказка «крути дальше» */}
          <div className="absolute bottom-[18px] left-1/2 -translate-x-1/2 v3-mono text-[10px] text-white/40 hidden md:block">
            Скролл
          </div>
        </section>
      </div>

      {/* ================= ЛОГОТИПЫ ПАРТНЁРОВ =================
          Соцдоказательство сразу после первого экрана: раньше эта строка
          лежала в самом низу блока пакетов, на 13-м экране прокрутки. */}
      <div className="relative bg-black border-y border-white/10 py-6 md:py-8 overflow-hidden">
        <div className="v3-container v3-mono text-[10px] text-white/35 mb-5 md:mb-6">
          С кем мы работаем
        </div>

        {/* Три ряда вместо одной строки: за раз видно втрое больше брендов,
            а сами логотипы стали крупнее. Соседние ряды едут навстречу,
            скорости чуть разные — иначе читается как одна плоскость. */}
        <div className="flex flex-col gap-5 md:gap-7">
          {logoRows.map((row, r) => (
            <div
              key={r}
              className="v3-marquee-row overflow-hidden whitespace-nowrap [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]"
            >
              <div
                className={`v3-marquee inline-flex items-center gap-12 md:gap-20 pr-12 md:pr-20 ${
                  r % 2 === 1 ? "v3-marquee--rev" : ""
                }`}
                style={{ "--speed": `${30 + r * 6}s` } as React.CSSProperties}
              >
                {/* дублируем ряд, чтобы прокрутка на -50% была бесшовной */}
                {[0, 1].flatMap((rep) =>
                  row.map((p, i) => (
                    <img
                      key={`${rep}-${i}`}
                      src={p.src}
                      alt={p.name}
                      className="h-8 md:h-9 w-auto object-contain shrink-0 brightness-0 invert opacity-55 hover:opacity-100 transition-opacity"
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= АУДИТОРИЯ ================= */}
      <section id="audience" className="relative bg-black v3-container py-[6vh] md:py-[10vh] scroll-mt-0">
        <span className="v3-noise" aria-hidden />

        <div className="relative grid lg:grid-cols-12 gap-6" data-reveal="">
          <div className="lg:col-span-4">
            <Eyebrow num={sectionNum.audience}>Аудитория</Eyebrow>
          </div>
          <div className="lg:col-span-8">
            <h3 className="v3-display v3-h3 text-white">Кто увидит ваш бренд</h3>
          </div>
        </div>

        {/* Цифры про зал. Размер сообщества сюда не выносим: он дублировал бы
            итог блока охвата ниже — там та же аудитория, только в разбивке. */}
        <div className="relative grid sm:grid-cols-2 lg:grid-cols-3 border-t border-white/10 mt-7 md:mt-14">
          {[
            { v: String(AUDIENCE_STATS.guests), l: "гостей события" },
            { v: `≈${AUDIENCE_STATS.decisionMakers}`, l: "руководителей и ЛПР" },
            { v: `≈${AUDIENCE_STATS.costPerContact}`, l: "BYN за один B2B-контакт" },
          ].map((s, i) => (
            <div
              key={s.l}
              className="border-b border-white/10 sm:border-r last:border-r-0 py-6 md:py-7 pr-5 v3-in"
              data-reveal=""
              style={{ "--delay": `${i * 70}ms` } as React.CSSProperties}
            >
              <div className="v3-display v3-stat text-[#c8ff00] tabular-nums">{s.v}</div>
              <div className="v3-mono text-[12px] md:text-[11px] text-white/55 mt-3.5">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Охват помимо зала — актив, который партнёр получает сверх события:
            логотип и упоминание живут в мини-аппе, чате и соцсетях.
            Телеграм считается живьём, Instagram — из константы. */}
        {reachChannels.length > 0 && (
          <div className="relative mt-9 md:mt-14 border border-white/12 p-5 md:p-7">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
              <div className="v3-mono text-[10px] md:text-[11px] text-[#c8ff00]">Охват помимо зала</div>
              <div className="v3-mono text-[10px] text-white/40">
                логотип и упоминание партнёра — во всех каналах
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-5 gap-y-6 mt-6">
              {reachChannels.map((c) => (
                <div key={c.label}>
                  <div className="v3-display text-[30px] md:text-[38px] leading-none tabular-nums text-white">
                    {c.value.toLocaleString("ru-RU")}
                  </div>
                  <div className="v3-mono text-[10px] text-white/45 mt-2.5">{c.label}</div>
                </div>
              ))}
              <div className="border-l border-white/12 pl-5">
                <div className="v3-display text-[30px] md:text-[38px] leading-none tabular-nums text-[#c8ff00]">
                  {reachTotal.toLocaleString("ru-RU")}
                </div>
                <div className="v3-mono text-[10px] text-white/45 mt-2.5">всего подписчиков</div>
              </div>
            </div>
          </div>
        )}

        {/* сегменты списком */}
        <div className="relative mt-9 md:mt-16 grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <p className="text-white/55 text-base max-w-[32ch]">
              {COMMUNITY_GEO.text} Уже {COMMUNITY_GEO.highlight.toLowerCase()} — и сообщество продолжает
              расти.
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-6">
              {COMMUNITY_GEO.places.map((p) => (
                <span key={p.label} className="v3-mono text-[11px] text-white/45">
                  <span aria-hidden className="mr-1.5">
                    {p.flag}
                  </span>
                  {p.label}
                </span>
              ))}
            </div>
          </div>

          <ul className="lg:col-span-8 border-t border-white/10">
            {AUDIENCE_SEGMENTS.map((seg, i) => (
              <li
                key={seg.title}
                className="border-b border-white/10 py-5 grid grid-cols-12 items-baseline gap-3 group v3-in"
                data-reveal=""
                style={{ "--delay": `${i * 50}ms` } as React.CSSProperties}
              >
                <span className="col-span-2 sm:col-span-1 v3-mono text-[11px] text-white/30 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="col-span-10 sm:col-span-6 text-[17px] md:text-xl text-white group-hover:text-[#c8ff00] transition-colors">
                  {seg.title}
                </span>
                <span className="col-start-3 sm:col-start-8 col-span-10 sm:col-span-5 v3-mono text-[11px] text-white/40">
                  {seg.sub}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ================= ПАРТНЁРСКИЕ ПАКЕТЫ ================= */}
      <section id="packages" className="relative bg-black v3-container py-[6vh] md:py-[10vh] scroll-mt-0">
        <span className="v3-noise" aria-hidden />
        <div className="relative grid lg:grid-cols-12 gap-6 mb-7 md:mb-14" data-reveal="">
          <div className="lg:col-span-4">
            <Eyebrow num={sectionNum.packages}>Партнёрам</Eyebrow>
          </div>
          <div className="lg:col-span-8">
            <h3 className="v3-display v3-h3 text-white">Два пакета участия</h3>
            <p className="text-white/55 text-base md:text-lg max-w-[46ch] mt-6">
              Стоимость — за одно мероприятие. Пакет на весь сезон считаем отдельно.
            </p>
          </div>
        </div>

        <div className="relative grid gap-3 lg:grid-cols-2">
          {PARTNER_PACKAGES.map((pkg, i) => {
            const gold = !!pkg.featured;
            return (
              <div
                key={pkg.id}
                className={`relative p-6 md:p-9 flex flex-col v3-in ${
                  gold ? "v3-surface-lime bg-[#c8ff00] text-black" : "border border-white/12 text-white"
                }`}
                data-reveal=""
                style={{ "--delay": `${i * 110}ms` } as React.CSSProperties}
              >
                {/* цена — главный акцент карточки, поэтому на мобиле она уходит
                    на свою строку и становится крупнее названия */}
                <div className="v3-mono text-[11px] opacity-50 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="v3-display text-[34px] md:text-[56px] leading-none mt-3">{pkg.name}</div>
                <div className="flex items-baseline gap-3 mt-4 md:mt-5">
                  <span
                    className={`v3-display v3-stat tabular-nums ${
                      gold ? "text-black" : "text-[#c8ff00]"
                    }`}
                  >
                    {pkg.price.toLocaleString("ru-RU")}
                  </span>
                  <span className="v3-mono text-[11px] opacity-50 whitespace-nowrap">
                    {pkg.currency} / ивент
                  </span>
                </div>

                <p className={`text-base mt-6 max-w-[38ch] ${gold ? "text-black/65" : "text-white/55"}`}>
                  {pkg.tagline}
                </p>

                <ul className={`mt-8 border-t ${gold ? "border-black/15" : "border-white/10"}`}>
                  {pkg.perks.map((perk) => (
                    <li
                      key={perk}
                      className={`py-3 border-b text-[15px] leading-snug ${
                        gold ? "border-black/15 text-black/80" : "border-white/10 text-white/70"
                      }`}
                    >
                      {perk}
                    </li>
                  ))}
                </ul>

                {pkg.extraPerks && (
                  <>
                    <div className="v3-mono text-[11px] mt-8 mb-1 flex items-center gap-3">
                      <span>И сверх того</span>
                      <span className="h-px flex-1 bg-black/25" />
                    </div>
                    <ul className="border-t border-black/15">
                      {pkg.extraPerks.map((perk) => (
                        <li key={perk} className="py-3 border-b border-black/15 text-[15px] leading-snug text-black">
                          {perk}
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                <div className="mt-auto pt-9">
                  {/* на лаймовой плашке кнопка сама станет чёрной — см. v3-surface-lime */}
                  <Btn
                    label="ОБСУДИТЬ ПАКЕТ"
                    href={TG_URL}
                    external
                    event="Lead"
                    eventParams={{ content_name: pkg.name, value: pkg.price, currency: pkg.currency }}
                  />
                </div>
              </div>
            );
          })}
        </div>

      </section>

      {/* ================= ОТЗЫВЫ =================
          Рендерится только когда в TESTIMONIALS есть реальные отзывы.
          Пока массив пуст, секции на странице нет вовсе. */}
      {TESTIMONIALS.length > 0 && (
        <section id="testimonials" className="relative bg-black v3-container py-[6vh] md:py-[10vh] scroll-mt-0">
          <span className="v3-noise" aria-hidden />
          <div className="relative mb-7 md:mb-14" data-reveal="">
            <Eyebrow num={sectionNum.testimonials}>Отзывы</Eyebrow>
            <h3 className="v3-display v3-h3 text-white mt-5 max-w-[16ch]">Что говорят партнёры</h3>
          </div>

          <div className="relative grid gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-3" data-reveal="">
            {TESTIMONIALS.map((t, i) => (
              <figure
                key={`${t.name}-${i}`}
                className="border border-white/12 p-6 md:p-7 flex flex-col v3-in"
                style={{ "--delay": `${i * 90}ms` } as React.CSSProperties}
              >
                <blockquote className="text-[17px] md:text-[18px] leading-snug text-white">
                  «{t.quote}»
                </blockquote>

                <figcaption className="flex items-center gap-4 mt-auto pt-7">
                  {t.photo ? (
                    <img
                      src={t.photo}
                      alt={t.name}
                      loading="lazy"
                      className="w-12 h-12 object-cover object-top border border-white/12 shrink-0"
                    />
                  ) : (
                    <span className="w-12 h-12 border border-white/12 shrink-0 flex items-center justify-center v3-mono text-[12px] text-[#c8ff00]">
                      {initials(t.name)}
                    </span>
                  )}
                  <div className="min-w-0">
                    <div className="v3-mono text-[12px] text-white truncate">
                      {/* ссылка на профиль — её наличие делает отзыв проверяемым */}
                      {t.href ? (
                        <a
                          href={t.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="v3-link inline-flex items-center gap-1.5"
                        >
                          {t.name}
                          <ArrowUpRight className="w-3 h-3 opacity-50" strokeWidth={1.5} />
                        </a>
                      ) : (
                        t.name
                      )}
                    </div>
                    <div className="v3-mono text-[10px] text-white/45 mt-1.5 truncate">
                      {[t.role, t.company].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* ================= ФОРМАТЫ ================= */}
      <section id="formats" className="relative bg-black scroll-mt-0">
        <span className="v3-noise" aria-hidden />
        <div className="relative v3-container pt-[9vh] md:pt-[14vh] pb-[6vh] md:pb-[10vh]">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6" data-reveal="">
            <h2 className="v3-display v3-h2 text-white">Форматы</h2>
            <p className="text-white/55 text-base md:text-lg max-w-[34ch] md:text-right">
              Утро, вечер и «Большая ИИшница» на {BIG_FORMAT_CAPACITY} человек — плюс всё, что вокруг
              сцены: доклады, нетворкинг и партнёрские интеграции.
            </p>
          </div>

          <div className="h-10 lg:h-16" />

          <div className="grid gap-3 sm:gap-0 sm:grid-cols-2 lg:grid-cols-5">
            {FORMATS.map((f, i) => (
              <a
                key={f.n}
                href={f.href}
                onClick={(e) => {
                  e.preventDefault();
                  jump(f.href);
                }}
                className="group flex flex-col v3-in"
                data-reveal=""
                style={{ "--delay": `${i * 70}ms` } as React.CSSProperties}
              >
                <div
                  className="aspect-[3/2] sm:aspect-square relative p-3 grow overflow-hidden"
                  style={{ background: f.bg, color: f.fg }}
                >
                  {/* На десктопе фото проявляется под курсором, как видео у
                      референса. На тач-устройствах ховера нет — там фото видно
                      всегда, иначе плитка остаётся пустым цветным квадратом. */}
                  <img
                    src={f.photo}
                    alt=""
                    loading="lazy"
                    aria-hidden
                    className="absolute inset-0 w-full h-full object-cover md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300"
                  />
                  {/* цветное тонирование — только эффект ховера на десктопе;
                      на мобиле оно бы просто испортило кадр */}
                  <span
                    aria-hidden
                    className="absolute inset-0 opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 mix-blend-color"
                    style={{ background: f.bg }}
                  />
                  {/* на мобиле номер лежит на фото — подкладываем под него тень */}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/50 to-transparent md:hidden"
                  />
                  <p className="relative v3-mono text-[11px] tabular-nums text-white md:text-inherit">
                    {f.n}
                  </p>
                  <div
                    className="absolute bottom-0 left-0 w-full h-14 lg:h-16 px-3 flex items-center transition-colors duration-300 group-hover:!bg-transparent group-hover:!text-white"
                    style={{ background: f.bar, color: f.fg }}
                  >
                    <span className="text-[15px] xl:text-lg leading-tight">{f.title}</span>
                  </div>
                </div>
                <div className="h-10 lg:h-14 flex items-center transition-[height] duration-300 group-hover:lg:h-0 overflow-hidden">
                  <span className="v3-mono text-[11px] text-white/45">{f.note}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ================= ВЕЕР → ЗАСТАВКА СЕЗОНА ================= */}
      <div ref={fanRef} className="relative h-[70vh] md:h-[86vh] overflow-hidden">
        <img
          src="/v2/photos/group-column.webp"
          alt="Гости ИИшницы"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        <span className="v3-noise" aria-hidden />
        {/* лаймовая штора расходится полоса за полосой и открывает кадр */}
        <div className="v3-fan">
          {[0.1, 0.3, 0.5, 0.7, 0.9, 1.1, 1.3, 1.5, 1.7, 1.9].map((g, i) => (
            <i key={i} style={{ "--g": g, "--i": i } as React.CSSProperties} />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 v3-container pb-8 md:pb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <h2 className="v3-display v3-h2 text-[#c8ff00]">
            Сезон
            <br />
            2026/2027
          </h2>
          <Btn
            label="ТЕЛЕГРАМ-БОТ"
            href={BOT_URL}
            external
            event="Subscribe"
            eventParams={{ content_name: "bot", source: "season_cover" }}
          />
        </div>
      </div>

      {/* ================= КАЛЕНДАРЬ СЕЗОНА ================= */}
      <section id="season" className="relative bg-black v3-container py-[6vh] md:py-[10vh] scroll-mt-0">
        <span className="v3-noise" aria-hidden />

        <div className="relative grid lg:grid-cols-12 gap-6 mb-7 md:mb-14" data-reveal="">
          <div className="lg:col-span-4">
            <Eyebrow num={sectionNum.season}>Календарь</Eyebrow>
          </div>
          <div className="lg:col-span-8">
            <h3 className="v3-display v3-h3 text-[#c8ff00]">
              Выбирайте даты
              <br />
              на весь сезон
            </h3>
            <p className="text-white/55 text-base md:text-lg max-w-[46ch] mt-6">
              {totals.events} встреч и {totals.seats.toLocaleString("ru-RU")} мест до июня 2027-го.
              Даты зафиксированы — место в сезоне можно занять заранее.
            </p>
          </div>
        </div>

        <div className="relative grid lg:grid-cols-12 gap-6">
          {/* превью-кадр слева, меняется под курсором */}
          <div className="lg:col-span-4 max-lg:hidden">
            <div className="sticky top-[calc(var(--v3-nav)+12px)] aspect-[4/5] overflow-hidden border border-white/10">
              {rowPreviews.map((p, i) => (
                <img
                  key={p.src}
                  src={p.src}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                    i === hoverRow ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
              <span className="absolute bottom-3 left-3 v3-mono text-[10px] text-white/70">
                Кадры с прошедших встреч
              </span>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="v3-grow-list border-t border-white/10">
              {SEASON_EVENTS.map((event, i) => (
                <SeasonRow
                  key={event.id}
                  event={event}
                  index={i}
                  isNext={event.id === nextEvent?.id}
                  onHover={() => setHoverRow(i % rowPreviews.length)}
                />
              ))}
            </div>

            <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-5">
              <Btn
                label="ЗАРЕГИСТРИРОВАТЬСЯ"
                href={BOT_URL}
                external
                event="CompleteRegistration"
                eventParams={{ content_name: "bot", source: "season_list" }}
              />
              <span className="v3-mono text-[11px] text-white/40">Вход для гостей — через бот</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= СПИКЕРЫ ================= */}
      <section id="speakers" className="relative bg-black v3-container py-[6vh] md:py-[10vh] scroll-mt-0">
        <span className="v3-noise" aria-hidden />
        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-7 md:mb-14" data-reveal="">
          <div>
            <Eyebrow num={sectionNum.speakers}>Спикеры</Eyebrow>
            <h3 className="v3-display v3-h3 text-white mt-5 max-w-[14ch]">Ради кого приходят</h3>
          </div>
          <p className="text-white/55 text-base max-w-[32ch] sm:text-right">
            Не консультанты с теорией, а те, кто уже внедрил ИИ у себя и показывает цифры.
          </p>
        </div>

        {/* [data-reveal] висит на сетке, а не на карточках: клипнутые дети
            имеют нулевую площадь и сами по себе в обзёрвер не попадают */}
        <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-reveal="">
          {SHOWCASE_SPEAKERS.map((s, i) => (
            <div
              key={s.name}
              className="v3-clip"
              style={{ "--delay": `${i * 90}ms` } as React.CSSProperties}
            >
              <a
                href="#season"
                onClick={(e) => {
                  e.preventDefault();
                  jump("#season");
                }}
                className="v3-tilt block group"
              >
                {/* карточки вырезаны из презентации вместе с фоном #1d1d1d —
                    поэтому подложка совпадает, а рамка задаёт край */}
                {/* имя и компания уже напечатаны на самой карточке — дублировать
                    подписью не нужно. Берём вариант с чёрной подложкой: он ложится
                    на страницу без плашки и без швов */}
                <img
                  src={s.cardOnBlack}
                  alt={`${s.name} — ${s.org}`}
                  loading="lazy"
                  className="block w-full h-auto"
                />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ================= ФОТООТЧЁТ ================= */}
      <section id="gallery" className="relative bg-black v3-container py-[6vh] md:py-[10vh] scroll-mt-0">
        <span className="v3-noise" aria-hidden />
        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-7 md:mb-14" data-reveal="">
          <div>
            <Eyebrow num={sectionNum.gallery}>Как это было</Eyebrow>
            <h3 className="v3-display v3-h3 text-white mt-5">Атмосфера</h3>
          </div>
          <p className="v3-mono text-[11px] text-white/40 sm:text-right">
            {GALLERY.length} кадров · нажмите, чтобы открыть
          </p>
        </div>

        <div className="relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3" data-reveal="">
          {visibleGallery.map((g, i) => (
            <button
              key={g.src}
              onClick={() => setLightbox(i)}
              aria-label={`Открыть фото: ${g.alt}`}
              className={`group relative overflow-hidden v3-clip ${
                g.wide ? "col-span-2 aspect-[16/10]" : "aspect-[4/5]"
              }`}
              style={{ "--delay": `${(i % 4) * 80}ms` } as React.CSSProperties}
            >
              <img
                src={g.src}
                alt={g.alt}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span
                aria-hidden
                className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
              {g.caption && (
                <span className="absolute bottom-3 left-3 right-3 text-left v3-mono text-[10px] text-[#c8ff00] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {g.caption}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* На мобиле показываем половину: фотоотчёт был самым длинным блоком
            страницы, а для партнёра он не главный аргумент. */}
        {visibleGallery.length < GALLERY.length && (
          <div className="flex justify-center mt-6 md:hidden">
            <Btn label={`ЕЩЁ ${GALLERY.length - visibleGallery.length} КАДРОВ`} onClick={() => setGalleryExpanded(true)} />
          </div>
        )}
      </section>

      {lightbox !== null && (
        <Lightbox
          index={lightbox}
          onClose={() => setLightbox(null)}
          onNav={(d) => setLightbox((i) => (i === null ? i : (i + d + GALLERY.length) % GALLERY.length))}
        />
      )}

      {/* ================= CTA-СЦЕНА ================= */}
      <div ref={ctaRef} className="relative bg-black min-h-[220vh] overflow-clip">
        {/* гигантский вордмарк на фоне, растёт по скроллу */}
        <div className="h-screen sticky top-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <div
            className="v3-display text-[#c8ff00] leading-none whitespace-nowrap opacity-[0.16]"
            style={{
              fontSize: "22vw",
              transform: "scale(calc(0.75 + 1.9 * var(--p, 0)))",
            }}
            aria-hidden
          >
            ИИШНИЦА
          </div>
        </div>

        <div id="contact" className="h-screen sticky top-0 flex items-center justify-center v3-container scroll-mt-0">
          <div className="relative text-center max-w-[900px]">
            {/* цифра вместо расплывчатого «те, кто принимает решения»:
                партнёр должен увидеть свою выгоду в числах */}
            <p className="v3-display v3-h3 v3-normal text-white max-w-[15ch] mx-auto">
              <span className="text-[#c8ff00]">{AUDIENCE_STATS.decisionMakers} руководителей</span> в
              зале за один вечер
            </p>
            <p className="text-white/55 text-base md:text-lg max-w-[52ch] mx-auto mt-6">
              Из {AUDIENCE_STATS.guests} гостей одного события. Ваш логотип, стенд и слово со сцены —
              от {PARTNER_PACKAGES[0].price.toLocaleString("ru-RU")} BYN.
            </p>

            {/* Карточка контакта — финальный аккорд сцены, поэтому кнопки
                живут внутри неё, а не отдельной строкой: так это один цельный
                объект, а не «заголовок + кнопки + виджет».
                Своя чёрная подложка обязательна — за блоком проходит
                гигантский вордмарк, на нём подписи тонут. */}
            <div className="mt-10 md:mt-14 mx-auto max-w-[820px] border border-white/12 bg-black/80 backdrop-blur-sm text-left">
              <div className="grid sm:grid-cols-[minmax(0,200px)_1fr]">
                {/* на десктопе фото тянется на всю высоту карточки, на узком —
                    ложится сверху широкой полосой */}
                <div className="relative overflow-hidden aspect-[16/10] sm:aspect-auto sm:min-h-full">
                  <img
                    src={PARTNER_CONTACT.photo}
                    alt={PARTNER_CONTACT.name}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover object-[center_22%] sm:object-top"
                  />
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-1 bg-[#c8ff00] sm:inset-y-0 sm:left-auto sm:right-0 sm:h-auto sm:w-1"
                  />
                </div>

                <div className="p-6 md:p-10 flex flex-col justify-center">
                  <div className="v3-mono text-[10px] md:text-[11px] text-[#c8ff00]">Партнёрство</div>
                  {/* имя в две строки — так оно работает как крупный типографский
                      блок, а не как строчка подписи */}
                  <div className="v3-display text-white text-[34px] md:text-[50px] leading-[0.88] mt-4">
                    {contactFirstName}
                    <br />
                    {contactLastName}
                  </div>
                  <p className="text-[15px] md:text-[17px] text-white/60 leading-snug mt-5 max-w-[30ch]">
                    {PARTNER_CONTACT.role}
                  </p>

                  <div className="flex flex-wrap gap-3 mt-7 md:mt-9">
                    <Btn
                      label={`@${PARTNER_CONTACT.telegram}`}
                      href={TG_URL}
                      external
                      event="Contact"
                      eventParams={{ method: "telegram", source: "cta" }}
                    />
                    <Btn
                      label={PARTNER_CONTACT.phone}
                      href={`tel:${PARTNER_CONTACT.phone.replace(/[^+\d]/g, "")}`}
                      event="Contact"
                      eventParams={{ method: "phone", source: "cta" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= ФУТЕР ================= */}
      <footer id="v3-footer" className="relative min-h-screen bg-black flex flex-col justify-end">
        <span className="v3-noise" aria-hidden />

        <div className="relative v3-container pb-6">
          <div
            className="v3-display text-[#c8ff00] leading-[0.78] mb-10 md:mb-16"
            style={{ fontSize: "clamp(3rem, 15.5vw, 15rem)" }}
          >
            ИИШНИЦА
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 mb-12">
            <div>
              <div className="v3-mono text-[10px] text-white/35 mb-4">Разделы</div>
              <ul className="flex flex-col gap-2">
                {menuLinks.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      onClick={(e) => {
                        e.preventDefault();
                        jump(l.href);
                      }}
                      className="v3-link text-[15px] text-white/80 hover:text-white"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="v3-mono text-[10px] text-white/35 mb-4">Сообщество</div>
              <p className="text-[15px] text-white/80 max-w-[26ch] leading-snug">{COMMUNITY_ABOUT.text}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4">
                {COMMUNITY_ABOUT.tags.map((t) => (
                  <span key={t} className="v3-mono text-[10px] text-white/40">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="v3-mono text-[10px] text-white/35 mb-4">Контакты</div>
              <ul className="flex flex-col gap-2 text-[15px]">
                <li>
                  <a href={TG_URL} target="_blank" rel="noopener noreferrer" className="v3-link text-white/80">
                    @{PARTNER_CONTACT.telegram}
                  </a>
                </li>
                <li>
                  <a
                    href={`tel:${PARTNER_CONTACT.phone.replace(/[^+\d]/g, "")}`}
                    className="v3-link text-white/80"
                  >
                    {PARTNER_CONTACT.phone}
                  </a>
                </li>
                <li>
                  <a href={BOT_URL} target="_blank" rel="noopener noreferrer" className="v3-link text-white/80">
                    Телеграм-бот
                  </a>
                </li>
              </ul>

              <div className="v3-mono text-[10px] text-white/35 mt-8 mb-4">Соцсети</div>
              <ul className="flex flex-col gap-2 text-[15px]">
                {SOCIAL_LINKS.map((s) => (
                  <li key={s.href}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="v3-link text-white/80 inline-flex items-center gap-2"
                    >
                      {s.label}
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-50" strokeWidth={1.5} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="v3-mono text-[10px] text-white/35 mb-4">Сезон</div>
              <div className="v3-display text-[#c8ff00] text-[44px] leading-none tabular-nums">
                {totals.events}
              </div>
              <div className="v3-mono text-[10px] text-white/40 mt-3">встреч 2026/2027</div>
              {/* та же цифра, что в блоке охвата — чтобы на странице не было
                  двух разных «размеров сообщества» */}
              <div className="v3-display text-white text-[44px] leading-none tabular-nums mt-6">
                {reachTotal.toLocaleString("ru-RU")}
              </div>
              <div className="v3-mono text-[10px] text-white/40 mt-3">подписчиков</div>
            </div>
          </div>

          <hr className="border-white/12" />
          <div className="flex flex-wrap justify-between gap-4 pt-4 v3-mono text-[10px] text-white/35">
            <span>© {new Date().getFullYear()} ИИшница · M.AI.N Community</span>
            <a href="/" className="v3-link">
              Основная версия сайта
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Строка календаря — растёт под курсором, как список оборудования      */
/* у референса                                                          */
/* ------------------------------------------------------------------ */

const SeasonRow: React.FC<{
  event: SeasonEvent;
  index: number;
  isNext: boolean;
  onHover: () => void;
}> = ({ event, index, isNext, onHover }) => {
  const big = event.capacity >= BIG_FORMAT_CAPACITY;
  const named = event.speakers.filter((s) => s.name);
  const unnamed = event.speakers.length - named.length;

  const who =
    event.speakers.length === 0
      ? "Спикеры уточняются"
      : [
          ...named.map((s) => s.name!),
          ...event.speakers.filter((s) => !s.name && s.org).map((s) => s.org),
        ].join(", ") || `${unnamed} спикера уточняются`;

  return (
    <div
      className="v3-grow-row border-b border-white/10 py-4 lg:py-0 flex items-center group cursor-default"
      onMouseEnter={onHover}
    >
      {/*
        Мобильная раскладка — две колонки: слева дата со спикерами, справа
        крупное число мест. Двенадцатиколоночная сетка на 390px разносила
        строку на четыре уровня и съедала левый край под номер.

        Дата и день недели по-прежнему в разных ячейках: на ховере дата
        увеличивается через scale, а scale не двигает соседей — рядом в одной
        ячейке они налезали друг на друга.
      */}
      <div className="flex items-center justify-between gap-4 w-full lg:grid lg:grid-cols-12 lg:gap-x-3">
        <div className="min-w-0 lg:contents">
          <div className="hidden lg:block lg:col-span-1 v3-mono text-[11px] text-white/30 tabular-nums">
            {String(index + 1).padStart(2, "0")}
          </div>

          <div className="lg:col-span-3 flex items-baseline gap-3 lg:block">
            <span className="v3-grow-title inline-block text-[26px] md:text-[22px] leading-none text-white group-hover:text-[#c8ff00] transition-colors whitespace-nowrap">
              {formatSeasonDate(event.date)}
            </span>
            <span className="v3-mono text-[10px] text-white/30 lg:hidden">
              {formatSeasonWeekday(event.date)}
            </span>
          </div>

          <div className="hidden lg:block lg:col-span-2 v3-mono text-[10px] text-white/30">
            {formatSeasonWeekday(event.date)}
          </div>

          <div className="lg:col-span-3 v3-mono text-[11px] text-white/45 truncate mt-2 lg:mt-0">
            {who}
          </div>
        </div>

        <div className="shrink-0 lg:col-span-3 flex items-center gap-3 lg:justify-end">
          {isNext && (
            <span className="v3-mono text-[10px] text-black bg-[#c8ff00] px-2 py-0.5 whitespace-nowrap">
              Ближайший
            </span>
          )}
          <div className="text-right lg:flex lg:items-baseline lg:gap-2.5">
            <span
              className={`v3-display text-[40px] md:text-[26px] leading-none tabular-nums block lg:inline ${
                big ? "text-[#c8ff00]" : "text-white"
              }`}
            >
              {event.capacity}
            </span>
            <span className="v3-mono text-[10px] text-white/30 block lg:inline">мест</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IishnicaV3;
