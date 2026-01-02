import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  ListMusic,
  Users,
  MapPin,
  Building2,
  Bot,
  UserCheck,
  MessageSquare,
  Send,
  FileText,
  Globe,
  Megaphone,
  Layers,
  Smartphone,
  BarChart3,
  Settings,
  CalendarCheck,
  QrCode,
  Award,
  User,
} from "lucide-react";
import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminLogin from "@/components/admin/AdminLogin";
import EventsManager from "@/components/admin/EventsManager";
import SponsorsManager from "@/components/admin/SponsorsManager";
import LeadsManager from "@/components/admin/LeadsManager";
import SpeakersManager from "@/components/admin/SpeakersManager";
import EventProgramManager from "@/components/admin/EventProgramManager";
import { BotUsersManager } from "@/components/admin/BotUsersManager";
import { BotRegistrationsManager } from "@/components/admin/BotRegistrationsManager";
import { BotFeedbackManager } from "@/components/admin/BotFeedbackManager";
import { LocationsManager } from "@/components/admin/LocationsManager";
import PostsManager from "@/components/admin/PostsManager";
import BroadcastManager from "@/components/admin/BroadcastManager";
import PageBuilderManager from "@/components/admin/page-builder/PageBuilderManager";
import { MiniappLeadsManager } from "@/components/admin/MiniappLeadsManager";
import { MiniappSettingsManager } from "@/components/admin/MiniappSettingsManager";
import { MiniappStatsManager } from "@/components/admin/MiniappStatsManager";
import { MiniappEventsManager } from "@/components/admin/MiniappEventsManager";
import { CheckInManager } from "@/components/admin/CheckInManager";
import { BadgesManager } from "@/components/admin/BadgesManager";
import { CompaniesManager } from "@/components/admin/CompaniesManager";

type TabValue =
  | "page-builder" | "events" | "program" | "speakers" | "locations" | "sponsors" | "leads"
  | "bot-users" | "bot-registrations" | "bot-feedback" | "broadcasts"
  | "miniapp-leads" | "miniapp-settings" | "miniapp-stats" | "miniapp-events" | "miniapp-checkin"
  | "posts"
  | "profile-badges" | "profile-companies";

interface MenuItem {
  value: TabValue;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface MenuSection {
  title: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  items: MenuItem[];
}

const menuSections: MenuSection[] = [
  {
    title: "Лендинг",
    icon: <Globe className="h-5 w-5" />,
    color: "text-purple-600",
    bgColor: "bg-purple-50 hover:bg-purple-100 border-purple-200",
    items: [
      { value: "page-builder", label: "Конструктор", icon: <Layers className="h-4 w-4" />, description: "Настройка секций" },
      { value: "events", label: "Мероприятия", icon: <Calendar className="h-4 w-4" />, description: "Управление событиями" },
      { value: "program", label: "Программа", icon: <ListMusic className="h-4 w-4" />, description: "Расписание выступлений" },
      { value: "speakers", label: "Спикеры", icon: <Users className="h-4 w-4" />, description: "База спикеров" },
      { value: "locations", label: "Локации", icon: <MapPin className="h-4 w-4" />, description: "Места проведения" },
      { value: "sponsors", label: "Спонсоры", icon: <Building2 className="h-4 w-4" />, description: "Партнёры и спонсоры" },
    ],
  },
  {
    title: "Telegram Бот",
    icon: <Bot className="h-5 w-5" />,
    color: "text-blue-600",
    bgColor: "bg-blue-50 hover:bg-blue-100 border-blue-200",
    items: [
      { value: "bot-users", label: "Пользователи", icon: <Users className="h-4 w-4" />, description: "Пользователи бота" },
      { value: "bot-registrations", label: "Регистрации", icon: <UserCheck className="h-4 w-4" />, description: "Заявки на события" },
      { value: "bot-feedback", label: "Фидбек", icon: <MessageSquare className="h-4 w-4" />, description: "Отзывы и обратная связь" },
      { value: "broadcasts", label: "Рассылки", icon: <Send className="h-4 w-4" />, description: "Массовые уведомления" },
    ],
  },
  {
    title: "Telegram Mini-App",
    icon: <Smartphone className="h-5 w-5" />,
    color: "text-cyan-600",
    bgColor: "bg-cyan-50 hover:bg-cyan-100 border-cyan-200",
    items: [
      { value: "miniapp-leads", label: "Лиды", icon: <Users className="h-4 w-4" />, description: "Регистрации из miniapp" },
      { value: "miniapp-events", label: "События", icon: <CalendarCheck className="h-4 w-4" />, description: "События в miniapp" },
      { value: "miniapp-checkin", label: "Чекин", icon: <QrCode className="h-4 w-4" />, description: "QR-сканер для чекина" },
      { value: "miniapp-stats", label: "Статистика", icon: <BarChart3 className="h-4 w-4" />, description: "Аналитика регистраций" },
      { value: "miniapp-settings", label: "Настройки", icon: <Settings className="h-4 w-4" />, description: "Конфигурация miniapp" },
    ],
  },
  {
    title: "Контент",
    icon: <FileText className="h-5 w-5" />,
    color: "text-green-600",
    bgColor: "bg-green-50 hover:bg-green-100 border-green-200",
    items: [
      { value: "posts", label: "Публикации", icon: <Megaphone className="h-4 w-4" />, description: "Блог и новости" },
      { value: "leads", label: "Участники", icon: <Users className="h-4 w-4" />, description: "База участников" },
    ],
  },
  {
    title: "Профили",
    icon: <User className="h-5 w-5" />,
    color: "text-amber-600",
    bgColor: "bg-amber-50 hover:bg-amber-100 border-amber-200",
    items: [
      { value: "profile-badges", label: "Бейджи", icon: <Award className="h-4 w-4" />, description: "Кастомные награды" },
      { value: "profile-companies", label: "Компании", icon: <Building2 className="h-4 w-4" />, description: "Организации" },
    ],
  },
];

const Admin = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabValue>("page-builder");

  // Проверяем авторизацию при загрузке страницы
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem("admin_token");
        if (token) {
          const userData = JSON.parse(token);
          if (userData && userData.username) {
            setIsAuthenticated(true);
            setUsername(userData.username);
          }
        }
      } catch (error) {
        console.error("Authentication error:", error);
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const handleLogin = (loggedInUsername: string) => {
    setIsAuthenticated(true);
    setUsername(loggedInUsername);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setIsAuthenticated(false);
    setUsername("");
  };

  // Показываем загрузку пока проверяем авторизацию
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  // Find current section and item for breadcrumb
  const getCurrentSection = () => {
    for (const section of menuSections) {
      const item = section.items.find(i => i.value === activeTab);
      if (item) return { section, item };
    }
    return null;
  };

  const current = getCurrentSection();

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar username={username} onLogout={handleLogout} onHomeClick={() => navigate("/")} />

      <main className="container mx-auto px-4 py-8">
        {/* Header with breadcrumb */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Панель администратора</h1>
          {current && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className={current.section.color}>{current.section.icon}</span>
              <span>{current.section.title}</span>
              <span>/</span>
              <span className="font-medium text-foreground">{current.item.label}</span>
            </div>
          )}
        </div>

        <div className="flex gap-6">
          {/* Sidebar Menu */}
          <aside className="w-64 flex-shrink-0">
            <div className="sticky top-4 space-y-4">
              {menuSections.map((section) => (
                <Card key={section.title} className="overflow-hidden">
                  <div className={`px-4 py-3 border-b ${section.bgColor.split(' ')[0]} flex items-center gap-2`}>
                    <span className={section.color}>{section.icon}</span>
                    <span className={`font-semibold ${section.color}`}>{section.title}</span>
                  </div>
                  <CardContent className="p-2">
                    <div className="space-y-1">
                      {section.items.map((item) => (
                        <button
                          key={item.value}
                          onClick={() => setActiveTab(item.value)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${
                            activeTab === item.value
                              ? `${section.bgColor} ${section.color} font-medium`
                              : "hover:bg-gray-100 text-gray-700"
                          }`}
                        >
                          <span className={activeTab === item.value ? section.color : "text-gray-400"}>
                            {item.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm truncate">{item.label}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)} className="w-full">
              <TabsList className="hidden">
                {menuSections.flatMap(s => s.items).map(item => (
                  <TabsTrigger key={item.value} value={item.value}>{item.label}</TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="page-builder" className="mt-0">
                <PageBuilderManager />
              </TabsContent>

              <TabsContent value="events" className="mt-0">
                <EventsManager />
              </TabsContent>

              <TabsContent value="program" className="mt-0">
                <EventProgramManager />
              </TabsContent>

              <TabsContent value="speakers" className="mt-0">
                <SpeakersManager />
              </TabsContent>

              <TabsContent value="locations" className="mt-0">
                <LocationsManager />
              </TabsContent>

              <TabsContent value="leads" className="mt-0">
                <LeadsManager />
              </TabsContent>

              <TabsContent value="sponsors" className="mt-0">
                <SponsorsManager />
              </TabsContent>

              <TabsContent value="bot-users" className="mt-0">
                <BotUsersManager />
              </TabsContent>

              <TabsContent value="bot-registrations" className="mt-0">
                <BotRegistrationsManager />
              </TabsContent>

              <TabsContent value="bot-feedback" className="mt-0">
                <BotFeedbackManager />
              </TabsContent>

              <TabsContent value="broadcasts" className="mt-0">
                <BroadcastManager />
              </TabsContent>

              <TabsContent value="posts" className="mt-0">
                <PostsManager />
              </TabsContent>

              <TabsContent value="miniapp-leads" className="mt-0">
                <MiniappLeadsManager />
              </TabsContent>

              <TabsContent value="miniapp-events" className="mt-0">
                <MiniappEventsManager />
              </TabsContent>

              <TabsContent value="miniapp-checkin" className="mt-0">
                <CheckInManager />
              </TabsContent>

              <TabsContent value="miniapp-stats" className="mt-0">
                <MiniappStatsManager />
              </TabsContent>

              <TabsContent value="miniapp-settings" className="mt-0">
                <MiniappSettingsManager />
              </TabsContent>

              <TabsContent value="profile-badges" className="mt-0">
                <BadgesManager />
              </TabsContent>

              <TabsContent value="profile-companies" className="mt-0">
                <CompaniesManager />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <Toaster />
    </div>
  );
};

export default Admin;
