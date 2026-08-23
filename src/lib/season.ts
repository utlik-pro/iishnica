/**
 * Данные сезона ИИшницы 2026/2027 и партнёрских пакетов.
 *
 * Используется новой версией лендинга (src/pages/IishnicaV2.tsx).
 * Старая версия сайта эти данные не читает.
 *
 * Даты храним в ISO — день недели и подписи считаются на лету,
 * чтобы не рассинхронизировать текст с календарём.
 */

export interface SeasonSpeaker {
  /** null — спикер ещё не объявлен */
  name: string | null;
  /** компания или краткое описание («Сбер», «Стартапер из Кремниевой долины») */
  org: string;
  /** файл в public/, если есть фото */
  photo?: string;
}

export interface SeasonEvent {
  id: string;
  /** ISO-дата начала */
  date: string;
  /** плановая вместимость площадки */
  capacity: number;
  speakers: SeasonSpeaker[];
  /** slug страницы события, если она уже опубликована */
  slug?: string;
}

/** Ивенты, где вместимость от этого значения, считаем «большим форматом». */
export const BIG_FORMAT_CAPACITY = 800;

export const SEASON_EVENTS: SeasonEvent[] = [
  {
    id: "2026-09-08",
    date: "2026-09-08",
    capacity: 300,
    speakers: [
      { name: "Кирилл Качан", org: "Скайпрофиль" },
      { name: "Алекс Шкор", org: "Стартапер из Кремниевой долины", photo: "/shkor.jpeg" },
    ],
  },
  {
    id: "2026-10-15",
    date: "2026-10-15",
    capacity: 300,
    speakers: [
      { name: "Эллина Дашук", org: "Сбер" },
      { name: null, org: "" },
    ],
  },
  {
    id: "2026-11-28",
    date: "2026-11-28",
    capacity: 800,
    speakers: [
      { name: null, org: "Т-банк" },
      { name: null, org: "Realting.com" },
      { name: null, org: "Евроторг" },
    ],
  },
  { id: "2026-12-17", date: "2026-12-17", capacity: 300, speakers: [] },
  { id: "2027-01-21", date: "2027-01-21", capacity: 300, speakers: [] },
  { id: "2027-02-20", date: "2027-02-20", capacity: 800, speakers: [] },
  { id: "2027-03-18", date: "2027-03-18", capacity: 300, speakers: [] },
  { id: "2027-04-22", date: "2027-04-22", capacity: 300, speakers: [] },
  { id: "2027-05-22", date: "2027-05-22", capacity: 800, speakers: [] },
  { id: "2027-06-17", date: "2027-06-17", capacity: 300, speakers: [] },
];

export interface PartnerPackage {
  id: "partner" | "gold";
  name: string;
  price: number;
  currency: string;
  tagline: string;
  /** пункты, входящие в пакет */
  perks: string[];
  /** пункты сверх базового пакета (только у Gold) */
  extraPerks?: string[];
  featured?: boolean;
}

/** База, общая для обоих пакетов. */
const BASE_PERKS = [
  "Размещение логотипа на сайте мероприятия",
  "Размещение логотипа в мини-эппке комьюнити",
  "Информация о партнёре в соцсетях комьюнити и ТГ-канале",
  "Присутствие на заставке экрана",
  "Логотип на таргетированной рекламе в Instagram",
];

export const PARTNER_PACKAGES: PartnerPackage[] = [
  {
    id: "partner",
    name: "Partner",
    price: 2000,
    currency: "BYN",
    tagline: "Заметность на площадке и в digital-каналах комьюнити",
    perks: BASE_PERKS,
  },
  {
    id: "gold",
    name: "Gold",
    price: 5000,
    currency: "BYN",
    tagline: "Голос со сцены, стенд в зале и прямой контакт с аудиторией",
    perks: BASE_PERKS,
    extraPerks: [
      "Роллап в зоне выступления",
      "Упоминание партнёра модератором ивента",
      "Приветственное слово от партнёра в начале мероприятия (до 5 мин)",
      "Выступление партнёра на ивенте (после согласования темы)",
      "Фирменный материал партнёра для каждого участника",
      "Стенд партнёра на мероприятии",
    ],
    featured: true,
  },
];

const MONTHS_GEN = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

/** «8 сентября» */
export const formatSeasonDate = (iso: string): string => {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_GEN[d.getMonth()]}`;
};

/** «вторник» */
export const formatSeasonWeekday = (iso: string): string =>
  new Date(iso).toLocaleDateString("ru-RU", { weekday: "long" });

/** Итоги сезона для строки со статистикой. */
export const seasonTotals = () => ({
  events: SEASON_EVENTS.length,
  seats: SEASON_EVENTS.reduce((sum, e) => sum + e.capacity, 0),
  maxCapacity: Math.max(...SEASON_EVENTS.map((e) => e.capacity)),
  bigFormat: SEASON_EVENTS.filter((e) => e.capacity >= BIG_FORMAT_CAPACITY).length,
});
