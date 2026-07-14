import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Calendar as CalendarIcon, Clock, Wallet, MapPin, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TeamSection from "@/components/TeamSection";
import EventLocationMap from "@/components/EventLocationMap";
import { getEventCover } from "@/lib/event-covers";

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

const EventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [speakers, setSpeakers] = useState<EventSpeaker[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [program, setProgram] = useState<ProgramItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchEvent(id);
    }
  }, [id]);

  const fetchEvent = async (eventIdOrSlug: string) => {
    setLoading(true);
    setError(null);
    try {
      // Try to fetch by slug first, then by id
      let eventData = null;
      let eventError = null;

      // Check if it looks like a UUID
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(eventIdOrSlug);

      if (!isUUID) {
        // Try by slug first
        const slugResult = await supabase
          .from("events")
          .select("*")
          .eq("slug", eventIdOrSlug)
          .single();

        if (!slugResult.error) {
          eventData = slugResult.data;
        }
      }

      // If not found by slug or is UUID, try by id
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

      // Fetch speakers
      const { data: speakersData, error: speakersError } = await supabase
        .from("event_speakers")
        .select(`
          speaker_id,
          talk_title,
          talk_description,
          order_index,
          speaker:speakers (
            id,
            name,
            title,
            description,
            photo_url
          )
        `)
        .eq("event_id", eventData.id)
        .order("order_index");

      if (speakersError) throw speakersError;

      const formattedSpeakers = (speakersData || []).map((item: any) => ({
        speaker_id: item.speaker_id,
        talk_title: item.talk_title,
        talk_description: item.talk_description,
        order_index: item.order_index,
        speaker: item.speaker,
      }));

      setSpeakers(formattedSpeakers);

      // Fetch sponsors
      const { data: eventSponsorsData } = await supabase
        .from("event_sponsors")
        .select(`
          tier,
          sponsor:sponsors (
            id,
            name,
            logo_url,
            website_url,
            tier
          )
        `)
        .eq("event_id", eventData.id);

      if (eventSponsorsData) {
        const formattedSponsors = eventSponsorsData
          .map((item: any) => {
            if (!item.sponsor) return null;
            return {
              ...item.sponsor,
              effectiveTier: item.tier || item.sponsor.tier || 'sponsor',
            };
          })
          .filter(Boolean);
        setSponsors(formattedSponsors);
      }

      // Fetch program
      const { data: programData } = await supabase
        .from("event_program")
        .select(`
          id,
          time_start,
          time_end,
          title,
          description,
          type,
          speaker_id,
          order_index,
          speaker:speakers (
            id,
            name,
            title,
            description,
            photo_url
          )
        `)
        .eq("event_id", eventData.id)
        .order("order_index");

      if (programData) {
        setProgram(programData as ProgramItem[]);
      }
    } catch (err) {
      console.error("Error fetching event:", err);
      setError("Ошибка загрузки мероприятия");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      weekday: "long",
    };
    return date.toLocaleDateString("ru-RU", options);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatProgramTime = (timeStart: string, timeEnd: string) => {
    // Format time from "HH:MM:SS" to "HH:MM"
    const start = timeStart.slice(0, 5);
    const end = timeEnd.slice(0, 5);
    return `${start}-${end}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="flex-grow flex items-center justify-center pt-28">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
            <h1 className="text-3xl font-bold mb-4">
              {error || "Мероприятие не найдено"}
            </h1>
            <Button onClick={() => navigate("/")} variant="outline">
              Вернуться на главную
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-28 pb-14 md:pt-44 md:pb-28 relative overflow-hidden">
        {/* Background photo — обложка события (БД → карта по slug → дефолт) */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <img
            src={event.cover_image_url || getEventCover(event.slug) || "/og-image.png"}
            alt=""
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              if (!img.src.endsWith("/og-image.png")) img.src = "/og-image.png";
            }}
            className="w-full h-full object-cover object-center opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-background/80" />
          <div className="absolute inset-0 ambient-lime opacity-70" />
        </div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center mb-4 md:mb-6 px-4 py-1.5 md:py-2 bg-white/[0.04] border border-white/[0.1] rounded-full backdrop-blur-sm">
              <span className="text-primary font-semibold text-xs md:text-sm tracking-wide">Мероприятие M.AI.N Community</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-black mb-5 md:mb-7 tracking-tight leading-[0.95]">
              {event.title.split(/(ИИшница)/g).map((part, i) =>
                part === "ИИшница" ? (
                  <span key={i} className="gradient-text">{part}</span>
                ) : (
                  <span key={i} className="text-foreground">{part}</span>
                )
              )}
            </h1>

            {event.description && (
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto px-2">
                {event.description}
              </p>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-8 md:mb-12 px-4 sm:px-0">
              <Button
                size="lg"
                className="w-full sm:w-auto rounded-full bg-primary text-primary-foreground hover:bg-lime-dark shadow-lime hover:shadow-lime-sm px-6 md:px-8 py-5 md:py-6 text-sm md:text-base font-semibold transition-all"
                onClick={() => window.open(`https://telegram.me/maincomapp_bot?startapp=event_${event.id}`, '_blank')}
              >
                Зарегистрироваться <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </div>

            {/* Info Badges - stack on mobile */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 md:gap-4 text-sm text-muted-foreground px-2 sm:px-0">
              <div className="flex items-center border border-white/[0.08] bg-white/[0.03] px-4 md:px-6 py-2 md:py-3 rounded-full w-full sm:w-auto justify-center backdrop-blur-sm">
                <CalendarIcon className="w-4 h-4 md:w-6 md:h-6 text-primary mr-2 md:mr-3 flex-shrink-0" />
                <div className="text-left">
                  <div className="text-[10px] md:text-xs text-muted-foreground">Дата</div>
                  <span className="text-sm md:text-lg font-medium text-foreground">{formatDate(event.date)}</span>
                </div>
              </div>
              <div className="flex items-center border border-white/[0.08] bg-white/[0.03] px-4 md:px-6 py-2 md:py-3 rounded-full w-full sm:w-auto justify-center backdrop-blur-sm">
                <Clock className="w-4 h-4 md:w-6 md:h-6 text-primary mr-2 md:mr-3 flex-shrink-0" />
                <div className="text-left">
                  <div className="text-[10px] md:text-xs text-muted-foreground">Время</div>
                  <span className="text-sm md:text-lg font-medium text-foreground">{formatTime(event.date)}</span>
                </div>
              </div>
              <div className="flex items-center border border-white/[0.08] bg-white/[0.03] px-4 md:px-6 py-2 md:py-3 rounded-full w-full sm:w-auto justify-center backdrop-blur-sm">
                <Wallet className="w-4 h-4 md:w-6 md:h-6 text-primary mr-2 md:mr-3 flex-shrink-0" />
                <div className="text-left">
                  <div className="text-[10px] md:text-xs text-muted-foreground">Стоимость</div>
                  <span className="text-sm md:text-lg font-medium text-foreground">
                    {event.price > 0 ? `${event.price} BYN` : "Бесплатно"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements - hidden on mobile */}
        <div className="hidden md:block absolute top-24 left-10 w-16 lg:w-24 h-16 lg:h-24 bg-primary/20 rounded-full blur-3xl opacity-60 animate-pulse-slow"></div>
        <div className="hidden md:block absolute top-40 right-10 lg:right-20 w-20 lg:w-32 h-20 lg:h-32 bg-primary/10 rounded-full blur-3xl opacity-60 animate-pulse-slow"></div>
      </section>

      {/* About Community Section */}
      <section id="about" className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <div className="flex justify-center mb-4 md:mb-6">
                <img
                  src="/Main-logo.webp"
                  alt="M.AI.N Community Logo"
                  className="h-14 md:h-20 w-auto"
                />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-3 md:mb-4">
                О <span className="gradient-text">комьюнити</span>
              </h2>
              <p className="text-base md:text-lg text-muted-foreground px-2">
                M.AI.N — это сообщество энтузиастов и профессионалов в области искусственного интеллекта
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-4 md:mb-8">
              <Card className="border border-white/[0.08] bg-card rounded-2xl shadow-card">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center mb-3 md:mb-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl md:text-2xl mr-3 md:mr-4 flex-shrink-0">
                      🎯
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-foreground">Наша миссия</h3>
                  </div>
                  <p className="text-sm md:text-base text-muted-foreground">
                    Делать искусственный интеллект доступным и понятным каждому. Мы объединяем специалистов и энтузиастов для обмена опытом и совместного роста.
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-white/[0.08] bg-card rounded-2xl shadow-card">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center mb-3 md:mb-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl md:text-2xl mr-3 md:mr-4 flex-shrink-0">
                      🚀
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-foreground">Что мы делаем</h3>
                  </div>
                  <p className="text-sm md:text-base text-muted-foreground">
                    Проводим регулярные митапы, мастер-классы и воркшопы по практическому применению ИИ в бизнесе и повседневной жизни.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="border border-white/[0.08] bg-card rounded-2xl shadow-card">
              <CardContent className="p-4 md:p-8">
                <div className="text-center">
                  <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-foreground">Присоединяйтесь к нам!</h3>
                  <p className="text-sm md:text-lg text-muted-foreground mb-4 md:mb-6 px-2">
                    Станьте частью растущего комьюнити профессионалов, которые используют ИИ для решения реальных задач
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-4 md:mb-6">
                    <div className="flex items-center gap-1.5 md:gap-2 bg-white/[0.05] border border-white/[0.08] px-3 md:px-4 py-1.5 md:py-2 rounded-full">
                      <span className="text-lg md:text-2xl">💡</span>
                      <span className="font-medium text-xs md:text-base text-foreground">Практические кейсы</span>
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2 bg-white/[0.05] border border-white/[0.08] px-3 md:px-4 py-1.5 md:py-2 rounded-full">
                      <span className="text-lg md:text-2xl">🤝</span>
                      <span className="font-medium text-xs md:text-base text-foreground">Нетворкинг</span>
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2 bg-white/[0.05] border border-white/[0.08] px-3 md:px-4 py-1.5 md:py-2 rounded-full">
                      <span className="text-lg md:text-2xl">📚</span>
                      <span className="font-medium text-xs md:text-base text-foreground">Обучение</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-center items-center gap-3 md:gap-6 pt-4 border-t border-white/[0.08]">
                    <p className="text-sm font-medium text-muted-foreground">Мы в соцсетях:</p>
                    <div className="flex gap-3">
                      <a
                        href="https://telegram.me/maincomby"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-white/[0.05] text-foreground hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center border border-white/[0.08]"
                        aria-label="Telegram"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.242-1.865-.442-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.14.121.098.155.23.171.324.016.094.037.308.02.475z" />
                        </svg>
                      </a>
                      <a
                        href="https://www.linkedin.com/company/maincomby/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-white/[0.05] text-foreground hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center border border-white/[0.08]"
                        aria-label="LinkedIn"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </a>
                      <a
                        href="https://www.instagram.com/maincomby/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-white/[0.05] text-foreground hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center border border-white/[0.08]"
                        aria-label="Instagram"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Speakers Section */}
      {speakers.length > 0 && (
        <section className="py-12 md:py-16 bg-[#0d0d0d]">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-8 md:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-3 md:mb-4 text-foreground">
                Спикеры <span className="gradient-text">мероприятия</span>
              </h2>
              <p className="text-sm md:text-lg text-muted-foreground px-2">
                Практические доклады от экспертов в области искусственного интеллекта
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
              {speakers.map((item) => (
                <Card key={item.speaker_id} className="border border-white/[0.08] bg-card rounded-2xl hover:shadow-lime-sm transition-shadow">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center mb-3 md:mb-4">
                      {item.speaker.photo_url ? (
                        <img
                          src={item.speaker.photo_url}
                          alt={item.speaker.name}
                          className="h-12 w-12 md:h-16 md:w-16 rounded-full object-cover mr-3 md:mr-4 flex-shrink-0"
                        />
                      ) : (
                        <div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mr-3 md:mr-4 flex-shrink-0 text-sm md:text-base">
                          {getInitials(item.speaker.name)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-bold text-base md:text-lg truncate text-foreground">{item.speaker.name}</h3>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Users className="w-3 h-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{item.speaker.title || "Спикер"}</span>
                        </div>
                      </div>
                    </div>

                    {item.talk_title && (
                      <h4 className="font-semibold text-primary mb-2 text-sm md:text-base">{item.talk_title}</h4>
                    )}
                    {item.talk_description && (
                      <p className="text-xs md:text-sm text-muted-foreground whitespace-pre-line">{item.talk_description}</p>
                    )}
                    {!item.talk_description && item.speaker.description && (
                      <p className="text-xs md:text-sm text-muted-foreground whitespace-pre-line">{item.speaker.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Partners Section */}
      {sponsors.length > 0 && (() => {
        const generalPartners = sponsors.filter(s => s.effectiveTier === 'general_partner');
        const partners = sponsors.filter(s => s.effectiveTier === 'partner');
        const regularSponsors = sponsors.filter(s => s.effectiveTier === 'sponsor');

        return (
          <section className="py-12 md:py-16 bg-background">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center mb-8 md:mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-3 md:mb-4 text-foreground">
                  <span className="gradient-text">Партнёры</span> мероприятия
                </h2>
                <p className="text-sm md:text-lg text-muted-foreground px-2">
                  Благодарим наших партнёров за поддержку
                </p>
              </div>

              <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
                {generalPartners.length > 0 && (
                  <div>
                    <p className="text-center text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 md:mb-6">
                      {generalPartners.length === 1 ? "Генеральный партнёр" : "Генеральные партнёры"}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 max-w-2xl mx-auto">
                      {generalPartners.map((sponsor) => (
                        <a
                          key={sponsor.id}
                          href={sponsor.website_url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <Card className="border border-primary/30 bg-card rounded-2xl hover:shadow-lime-sm transition-shadow">
                            <CardContent className="p-4 md:p-6 flex items-center justify-center min-h-[80px] md:min-h-[100px]">
                              {sponsor.logo_url ? (
                                <img
                                  src={sponsor.logo_url}
                                  alt={sponsor.name}
                                  className="max-h-16 md:max-h-24 max-w-full object-contain"
                                />
                              ) : (
                                <span className="text-lg md:text-xl font-semibold text-foreground">{sponsor.name}</span>
                              )}
                            </CardContent>
                          </Card>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {partners.length > 0 && (
                  <div>
                    <p className="text-center text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 md:mb-6">
                      {partners.length === 1 ? "Партнёр" : "Партнёры"}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-3xl mx-auto">
                      {partners.map((sponsor) => (
                        <a
                          key={sponsor.id}
                          href={sponsor.website_url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <Card className="border border-white/[0.08] bg-card rounded-2xl hover:shadow-lime-sm transition-shadow">
                            <CardContent className="p-3 md:p-5 flex items-center justify-center min-h-[64px] md:min-h-[80px]">
                              {sponsor.logo_url ? (
                                <img
                                  src={sponsor.logo_url}
                                  alt={sponsor.name}
                                  className="max-h-12 md:max-h-16 max-w-full object-contain"
                                />
                              ) : (
                                <span className="text-sm md:text-base font-semibold text-foreground">{sponsor.name}</span>
                              )}
                            </CardContent>
                          </Card>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {regularSponsors.length > 0 && (
                  <div>
                    <p className="text-center text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4 md:mb-6">
                      {regularSponsors.length === 1 ? "Спонсор" : "Спонсоры"}
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
                      {regularSponsors.map((sponsor) => (
                        <a
                          key={sponsor.id}
                          href={sponsor.website_url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group"
                        >
                          {sponsor.logo_url ? (
                            <img
                              src={sponsor.logo_url}
                              alt={sponsor.name}
                              className="h-10 md:h-14 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
                            />
                          ) : (
                            <div className="px-4 py-2 bg-white/[0.05] border border-white/[0.08] rounded-lg group-hover:bg-primary/10 transition-colors">
                              <span className="text-sm font-medium text-muted-foreground group-hover:text-primary">
                                {sponsor.name}
                              </span>
                            </div>
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      })()}

      {/* Program Section */}
      {program.length > 0 && (
        <section id="program" className="py-12 md:py-16 bg-[#0d0d0d]">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-8 md:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-3 md:mb-4 text-foreground">
                <span className="gradient-text">Программа</span> мероприятия
              </h2>
              <p className="text-sm md:text-lg text-muted-foreground px-2">
                Детальное расписание вечера с описанием выступлений
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-3 md:space-y-6">
              {program.map((item) => (
                <Card key={item.id} className="border border-white/[0.08] bg-card rounded-2xl">
                  <CardContent className="p-3 md:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                      <div className={`flex-shrink-0 font-bold px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm self-start ${item.type === 'networking' ? 'bg-primary/10 text-primary' :
                          item.type === 'break' ? 'bg-warning/15 text-warning' :
                            'bg-secondary text-secondary-foreground'
                        }`}>
                        {formatProgramTime(item.time_start, item.time_end)}
                      </div>
                      <div className="flex-1 min-w-0">
                        {item.speaker ? (
                          <>
                            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                              {item.speaker.photo_url ? (
                                <img
                                  src={item.speaker.photo_url}
                                  alt={item.speaker.name}
                                  className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0 text-xs md:text-sm">
                                  {getInitials(item.speaker.name)}
                                </div>
                              )}
                              <div className="min-w-0">
                                <h3 className="text-base md:text-xl font-bold truncate text-foreground">{item.speaker.name}</h3>
                                <p className="text-xs md:text-sm text-muted-foreground truncate">{item.speaker.title}</p>
                              </div>
                            </div>
                            <h4 className="text-sm md:text-lg font-semibold text-primary mb-2 md:mb-3">{item.title}</h4>
                            {item.description && (
                              <p className="text-xs md:text-base text-muted-foreground whitespace-pre-line">{item.description}</p>
                            )}
                          </>
                        ) : (
                          <>
                            <h3 className="text-base md:text-xl font-bold mb-1 md:mb-2 text-foreground">{item.title}</h3>
                            {item.description && (
                              <p className="text-xs md:text-base text-muted-foreground whitespace-pre-line">{item.description}</p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Team Section */}
      <TeamSection />

      {/* Location Section */}
      {(event.location_name || event.location_address) && (
        <section className="py-12 md:py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-8 md:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-3 md:mb-4 text-foreground">
                <span className="gradient-text">Место</span> проведения
              </h2>
              {event.location_name && (
                <p className="text-base md:text-lg text-muted-foreground mb-2">
                  {event.location_name}
                </p>
              )}
              {event.location_address && (
                <div className="flex items-center justify-center text-muted-foreground text-sm md:text-base">
                  <MapPin className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2 flex-shrink-0" />
                  <span>{event.location_address}</span>
                </div>
              )}
            </div>

            <div className="max-w-4xl mx-auto">
              <EventLocationMap
                address={event.location_address || undefined}
                yandexMapUrl={event.yandex_map_url}
              />
            </div>
          </div>
        </section>
      )}

      {/* Registration CTA */}
      <section className="py-12 md:py-16 bg-[#0d0d0d]">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="border border-white/[0.08] bg-card rounded-2xl shadow-card">
              <CardContent className="p-4 md:p-8">
                <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-foreground">
                  Регистрация на мероприятие
                </h2>
                <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6">
                  Стоимость участия:{" "}
                  <span className="font-bold text-foreground">
                    {event.price > 0 ? `${event.price} BYN` : "Бесплатно"}
                  </span>
                </p>
                <Button
                  size="lg"
                  className="w-full sm:w-auto rounded-full bg-primary text-primary-foreground hover:bg-lime-dark shadow-lime hover:shadow-lime-sm px-6 md:px-8 py-5 md:py-6 text-sm md:text-base font-semibold transition-all"
                  onClick={() => window.open(`https://telegram.me/maincomapp_bot?startapp=event_${event.id}`, '_blank')}
                >
                  Зарегистрироваться <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default EventPage;
