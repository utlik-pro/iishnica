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
  /**
   * Слайдшоу в блоке «О сообществе».
   * Чтобы добавить кадр: положи файл в public/v2/ и допиши строку сюда —
   * счётчик, точки и автопрокрутка подхватят его сами.
   */
  photos: [
    // кадр вертикальный, люди в нижней части — смещаем кроп вниз, чтобы не срезать их
    {
      src: "/v2/community.webp",
      alt: "Общее фото участников комьюнити M.AI.N",
      caption: "Минск",
      position: "center 72%",
    },
    { src: "/v2/photos/hall-full.webp", alt: "Полный зал на Вечерней ИИшнице", caption: "Полный зал" },
    { src: "/v2/gallery-3.webp", alt: "Зрители в зале на ИИшнице", caption: "Вечерняя ИИшница" },
    { src: "/v2/photos/group-column.webp", alt: "Групповое фото участников", caption: "Гости вечера" },
    { src: "/v2/gallery-1.webp", alt: "Аудитория ИИшницы", caption: "Аудитория" },
    { src: "/v2/photos/guests-smile.webp", alt: "Участницы ИИшницы", caption: "Нетворкинг" },
    { src: "/v2/gallery-4.webp", alt: "Участники ИИшницы аплодируют", caption: "После выступлений" },
    { src: "/v2/photos/talk-screen.webp", alt: "Выступление и презентация на экране", caption: "Доклад" },
    { src: "/v2/gallery-2.webp", alt: "Выступление на сцене ИИшницы", caption: "На сцене" },
  ] as { src: string; alt: string; caption: string; position?: string }[],
  photoBadge: "Комьюнити M.AI.N",
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
  /** ≈50 BYN — стоимость одного B2B-контакта в пакете (слайд «Аудитория, которую видит партнёр») */
  costPerContact: 50,
};

/** Контакт по партнёрству — как на слайде «Обсудим партнёрство». */
export const PARTNER_CONTACT = {
  name: "Яна Мартыненко",
  role: "Сооснователь M.AI.N Community · Директор по развитию сообщества",
  telegram: "yana_martynen",
  phone: "+375 29 178 51 52",
  photo: "/v2/contact-person.webp",
};

/**
 * Фотоотчёт. Кадры из /v2/photos/ сняты на Вечерней ИИшнице 31.07.2026,
 * из /v2/gallery-*.webp — вырезаны из партнёрской презентации.
 *
 * `wide: true` — кадр занимает две колонки в мозаике (годится для общих планов).
 * Чтобы добавить фото: положи файл в public/v2/photos/ и допиши строку —
 * мозаика, счётчик и лайтбокс подхватят его сами.
 */
export const GALLERY: { src: string; alt: string; caption?: string; wide?: boolean }[] = [
  { src: "/v2/photos/hall-full.webp", alt: "Полный зал на Вечерней ИИшнице", caption: "Полный зал", wide: true },
  { src: "/v2/photos/brandwall-partners.webp", alt: "Заставка мероприятия с логотипами партнёров", caption: "Логотипы партнёров на заставке" },
  { src: "/v2/gallery-1.webp", alt: "Зрители на ИИшнице", caption: "Аудитория" },
  { src: "/v2/photos/talk-screen.webp", alt: "Выступление и презентация на экране", caption: "Доклад" },
  { src: "/v2/photos/group-column.webp", alt: "Групповое фото участников ИИшницы", caption: "Гости вечера" },
  { src: "/v2/photos/guests-smile.webp", alt: "Участницы ИИшницы", caption: "Нетворкинг" },
  { src: "/v2/gallery-2.webp", alt: "Выступление на сцене ИИшницы", caption: "На сцене" },
  { src: "/v2/photos/networking.webp", alt: "Общение участников до начала", caption: "До начала" },
  { src: "/v2/photos/hall-seats.webp", alt: "Зал перед выступлениями", caption: "Зал наполняется" },
  { src: "/v2/gallery-3.webp", alt: "Зрители в зале", caption: "Вечерняя ИИшница" },
  { src: "/v2/photos/group-wall.webp", alt: "Групповое фото у стены", caption: "Все свои" },
  { src: "/v2/photos/brandwall-duo.webp", alt: "Гости у фотозоны ИИшницы", caption: "Фотозона" },
  { src: "/v2/gallery-4.webp", alt: "Участники ИИшницы аплодируют", caption: "После выступлений" },
  { src: "/v2/photos/thumbs-up.webp", alt: "Участник ИИшницы показывает большой палец", caption: "Всё получилось" },
  { src: "/v2/photos/brandwall-pair.webp", alt: "Гости у фотозоны", caption: "Фотозона" },
  { src: "/v2/gallery-5.webp", alt: "Ведущие Вечерней ИИшницы", caption: "Ведущие" },
  { src: "/v2/photos/venue-red.webp", alt: "Интерьер площадки с подсветкой", caption: "Площадка" },
];
