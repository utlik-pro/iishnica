/**
 * Контент из партнёрского предложения «Большая ИИшница» (v2.3):
 * о сообществе, география, спикеры, аудитория, фотоотчёт.
 *
 * Картинки — в public/v2/ (вырезаны из презентации).
 * Используется только новой версией лендинга (src/pages/IishnicaV2.tsx).
 */

/** Фон, на котором вырезаны карточки спикеров. Секция должна совпадать по цвету,
 *  иначе вокруг карточек видны прямоугольные швы. */
export const SPEAKER_CARD_BG = "#1d1d1d";

export const COMMUNITY_ABOUT = {
  eyebrow: "О сообществе",
  title: "Первое AI-сообщество",
  titleAccent: "в Беларуси",
  text:
    "M.AI.N объединяет предпринимателей, руководителей и специалистов вокруг искусственного " +
    "интеллекта. Мы делаем ИИ понятным и применимым — через события, обучение и живое комьюнити.",
  tags: ["Офлайн-события", "Обучение", "Нетворкинг ЛПР"],
  photo: "/v2/community.webp",
  photoBadge: "Комьюнити M.AI.N",
  photoCaption: "Минск",
};

export const COMMUNITY_GEO = {
  eyebrow: "География",
  title: "M.AI.N — уже за пределами",
  titleAccent: "Беларуси",
  text: "Минск, Гродно, Брест, Могилёв, Гомель — и теперь за рубежом: Москва и Баку.",
  places: [
    { flag: "🇧🇾", label: "Беларусь" },
    { flag: "🇷🇺", label: "Москва" },
    { flag: "🇦🇿", label: "Баку" },
  ],
  highlight: "3 страны",
  map: "/v2/geo-map.webp",
};

/** Карточки уже содержат имя, компанию и логотип — они вырезаны из презентации целиком. */
export const SHOWCASE_SPEAKERS: { name: string; org: string; card: string }[] = [
  { name: "Игорь Бичель", org: "МТБанк", card: "/v2/speakers/bichel.webp" },
  { name: "Матвей Лисицкий", org: "1AK Group", card: "/v2/speakers/lisitsky.webp" },
  { name: "Денис Бабицкий", org: "A-100 Девелопмент", card: "/v2/speakers/babitsky.webp" },
  { name: "Александр Цалко", org: "BMW", card: "/v2/speakers/tsalko.webp" },
  { name: "Эллина Дашук", org: "Сбер", card: "/v2/speakers/dashuk.webp" },
  { name: "Вадим Владымцев", org: "StackLevel Group", card: "/v2/speakers/vladymtsev.webp" },
];

/** Иконки задаются в компоненте — здесь только смысловая часть. */
export const AUDIENCE_SEGMENTS: { title: string; sub: string; icon: string }[] = [
  { title: "Собственники и предприниматели", sub: "Определяют бюджеты и стратегию", icon: "briefcase" },
  { title: "Топ-менеджмент и руководители", sub: "C-level, директора направлений", icon: "userCog" },
  { title: "Маркетинг, продажи, развитие", sub: "Те, кто внедряет AI в рост", icon: "trending" },
  { title: "IT, продукт, аналитика", sub: "Разработка и данные", icon: "cpu" },
  { title: "HR, обучение, консалтинг", sub: "Развитие команд и экспертиза", icon: "graduation" },
  { title: "Стартапы и инвесторы", sub: "Новые продукты и сделки", icon: "rocket" },
];

/** Цифры по одному большому мероприятию — из партнёрского предложения. */
export const AUDIENCE_STATS = {
  guests: 500,
  decisionMakers: 235,
};

export const GALLERY: { src: string; alt: string; caption?: string }[] = [
  { src: "/v2/gallery-1.webp", alt: "Полный зал на ИИшнице", caption: "Полный зал" },
  { src: "/v2/gallery-2.webp", alt: "Выступление на сцене ИИшницы" },
  { src: "/v2/gallery-3.webp", alt: "Зрители в зале" },
  { src: "/v2/gallery-4.webp", alt: "Участники ИИшницы аплодируют" },
  { src: "/v2/gallery-5.webp", alt: "Ведущие Вечерней ИИшницы" },
];
