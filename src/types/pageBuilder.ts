// Page Builder Types

export type SectionType =
  | 'navbar'
  | 'hero'
  | 'about'
  | 'events'
  | 'team'
  | 'sponsors'
  | 'blog'
  | 'register'
  | 'footer';

export interface PageConfig {
  id: string;
  page_slug: string;
  name: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface PageSection {
  id: string;
  page_config_id: string;
  section_type: SectionType;
  order_index: number;
  is_visible: boolean;
  config: SectionConfig;
  created_at: string;
  updated_at: string;
}

// Section Configs

export interface NavbarConfig {
  logo: {
    imageUrl: string;
    title: string;
  };
  menuItems: Array<{
    id: string;
    label: string;
    type: 'scroll' | 'link';
    target: string;
  }>;
  ctaButton: {
    text: string;
    url: string;
    isVisible: boolean;
  };
}

export interface HeroConfig {
  title: string;
  subtitle: string;
  buttons: Array<{
    id: string;
    text: string;
    variant: 'primary' | 'outline';
    target: string;
    icon?: string;
  }>;
  badges: Array<{
    id: string;
    icon: 'calendar' | 'clock' | 'wallet';
    text: string;
    color: 'green' | 'blue' | 'purple';
  }>;
}

export interface AboutConfig {
  title: {
    prefix: string;
    highlight: string;
  };
  description: string;
  cards: Array<{
    id: string;
    icon: 'calendar' | 'message' | 'users';
    title: string;
    description: string;
  }>;
}

export interface EventsConfig {
  title: {
    prefix: string;
    highlight: string;
  };
  description: string;
  maxItems: number;
  showCalendar: boolean;
  sidebarTitle: string;
  sidebarDescription: string;
  priceInfo: string;
  buttonText: string;
}

export interface TeamConfig {
  title: {
    prefix: string;
    highlight: string;
  };
  description: string;
}

export interface SponsorsConfig {
  title: {
    prefix: string;
    highlight: string;
  };
}

export interface BlogConfig {
  title: {
    prefix: string;
    highlight: string;
  };
  description: string;
  maxItems: number;
  buttonText: string;
  buttonLink: string;
}

export interface RegisterConfig {
  title: {
    prefix: string;
    highlight: string;
  };
  description: string;
  formTitle: string;
  formDescription: string;
  submitButtonText: string;
  privacyText: string;
}

export interface FooterConfig {
  logo: {
    title: string;
    tagline: string;
  };
  navigation: {
    title: string;
    items: Array<{
      id: string;
      label: string;
      type: 'scroll' | 'link';
      target: string;
    }>;
  };
  contacts: {
    title: string;
    email: string;
    phone: string;
  };
  copyright: string;
  bottomLinks: Array<{
    id: string;
    label: string;
    target: string;
  }>;
}

export type SectionConfig =
  | NavbarConfig
  | HeroConfig
  | AboutConfig
  | EventsConfig
  | TeamConfig
  | SponsorsConfig
  | BlogConfig
  | RegisterConfig
  | FooterConfig;

// Default Configs

export const DEFAULT_NAVBAR_CONFIG: NavbarConfig = {
  logo: {
    imageUrl: '/Main-logo.webp',
    title: 'ИИшница',
  },
  menuItems: [
    { id: '1', label: 'Главная', type: 'scroll', target: 'top' },
    { id: '2', label: 'О комьюнити', type: 'scroll', target: 'about' },
    { id: '3', label: 'Программа', type: 'scroll', target: 'program' },
    { id: '4', label: 'Команда', type: 'scroll', target: 'team' },
    { id: '5', label: 'Календарь', type: 'link', target: '/calendar' },
    { id: '6', label: 'Блог', type: 'link', target: '/blog' },
  ],
  ctaButton: {
    text: 'Регистрация',
    url: 'https://t.me/maincomapp_bot',
    isVisible: true,
  },
};

export const DEFAULT_HERO_CONFIG: HeroConfig = {
  title: 'ИИшница',
  subtitle: 'Еженедельные практические завтраки с искусственным интеллектом',
  buttons: [
    { id: '1', text: 'Зарегистрироваться', variant: 'primary', target: '#register', icon: 'ArrowRight' },
    { id: '2', text: 'Подробнее о клубе', variant: 'outline', target: '#about' },
  ],
  badges: [
    { id: '1', icon: 'calendar', text: 'По вторникам', color: 'green' },
    { id: '2', icon: 'clock', text: '10:00 - 12:00', color: 'blue' },
    { id: '3', icon: 'wallet', text: '25 BYN', color: 'purple' },
  ],
};

export const DEFAULT_ABOUT_CONFIG: AboutConfig = {
  title: {
    prefix: 'Что такое',
    highlight: 'ИИшница',
  },
  description: 'ИИшница — это еженедельный клуб-завтрак, где мы вместе решаем практические задачи с использованием искусственного интеллекта.',
  cards: [
    {
      id: '1',
      icon: 'calendar',
      title: 'Еженедельные встречи',
      description: 'Каждый вторник с 10:00 до 12:00 мы собираемся, чтобы решать практические задачи с помощью ИИ.',
    },
    {
      id: '2',
      icon: 'message',
      title: 'Практический подход',
      description: 'На каждом завтраке мы фокусируемся на решении одной конкретной задачи с использованием технологий ИИ.',
    },
    {
      id: '3',
      icon: 'users',
      title: 'Сообщество',
      description: 'Присоединяйтесь к растущему комьюнити энтузиастов ИИ, обменивайтесь идеями и развивайте навыки вместе с нами.',
    },
  ],
};

export const DEFAULT_EVENTS_CONFIG: EventsConfig = {
  title: {
    prefix: 'Расписание ближайших',
    highlight: 'завтраков',
  },
  description: 'Присоединяйтесь к нашим еженедельным встречам каждый вторник с 10:00 до 12:00',
  maxItems: 3,
  showCalendar: true,
  sidebarTitle: 'Регулярные встречи',
  sidebarDescription: 'Наши завтраки проходят каждый вторник с 10:00 до 12:00. Каждая встреча посвящена решению конкретной задачи с использованием инструментов искусственного интеллекта.',
  priceInfo: 'Стоимость участия в одном завтраке — <strong>25 BYN</strong>.',
  buttonText: 'Посмотреть все мероприятия',
};

export const DEFAULT_TEAM_CONFIG: TeamConfig = {
  title: {
    prefix: 'Наша',
    highlight: 'команда',
  },
  description: 'Познакомьтесь с людьми, которые делают ИИшницу местом для роста и развития',
};

export const DEFAULT_SPONSORS_CONFIG: SponsorsConfig = {
  title: {
    prefix: 'Наши',
    highlight: 'спонсоры',
  },
};

export const DEFAULT_BLOG_CONFIG: BlogConfig = {
  title: {
    prefix: 'Наш',
    highlight: 'блог',
  },
  description: 'Статьи и новости о применении ИИ в бизнесе',
  maxItems: 3,
  buttonText: 'Все статьи',
  buttonLink: '/blog',
};

export const DEFAULT_REGISTER_CONFIG: RegisterConfig = {
  title: {
    prefix: 'Присоединяйтесь к',
    highlight: 'ИИшнице',
  },
  description: 'Зарегистрируйтесь, чтобы получать уведомления о предстоящих мероприятиях и бронировать места на завтраках',
  formTitle: 'Регистрация',
  formDescription: 'Заполните форму, чтобы присоединиться к нашему сообществу',
  submitButtonText: 'Зарегистрироваться',
  privacyText: 'Регистрируясь, вы соглашаетесь с нашей политикой конфиденциальности и условиями использования.',
};

export const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  logo: {
    title: 'ИИшница',
    tagline: 'Мероприятия от M.AI.N - AI Community',
  },
  navigation: {
    title: 'Навигация',
    items: [
      { id: '1', label: 'Главная', type: 'scroll', target: 'top' },
      { id: '2', label: 'О комьюнити', type: 'scroll', target: 'about' },
      { id: '3', label: 'Программа', type: 'scroll', target: 'program' },
      { id: '4', label: 'Команда', type: 'scroll', target: 'team' },
    ],
  },
  contacts: {
    title: 'Контакты',
    email: 'admin@utlik.pro',
    phone: '+375 44 755 4000',
  },
  copyright: '© {year} ИИшница. M.AI.N - AI Community',
  bottomLinks: [
    { id: '1', label: 'Политика конфиденциальности', target: 'privacy' },
    { id: '2', label: 'Условия использования', target: 'terms' },
  ],
};

export const DEFAULT_CONFIGS: Record<SectionType, SectionConfig> = {
  navbar: DEFAULT_NAVBAR_CONFIG,
  hero: DEFAULT_HERO_CONFIG,
  about: DEFAULT_ABOUT_CONFIG,
  events: DEFAULT_EVENTS_CONFIG,
  team: DEFAULT_TEAM_CONFIG,
  sponsors: DEFAULT_SPONSORS_CONFIG,
  blog: DEFAULT_BLOG_CONFIG,
  register: DEFAULT_REGISTER_CONFIG,
  footer: DEFAULT_FOOTER_CONFIG,
};

export const SECTION_LABELS: Record<SectionType, string> = {
  navbar: 'Навигация',
  hero: 'Главный экран',
  about: 'О нас',
  events: 'Мероприятия',
  team: 'Команда',
  sponsors: 'Спонсоры',
  blog: 'Блог',
  register: 'Регистрация',
  footer: 'Подвал',
};

export const SECTION_ICONS: Record<SectionType, string> = {
  navbar: 'Menu',
  hero: 'Layout',
  about: 'Info',
  events: 'Calendar',
  team: 'Users',
  sponsors: 'Heart',
  blog: 'FileText',
  register: 'UserPlus',
  footer: 'Footprints',
};
