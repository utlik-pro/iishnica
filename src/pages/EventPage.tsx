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
          sponsor:sponsors (
            id,
            name,
            logo_url,
            website_url
          )
        `)
        .eq("event_id", eventData.id);

      if (eventSponsorsData) {
        const formattedSponsors = eventSponsorsData
          .map((item: any) => item.sponsor)
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
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="flex-grow flex items-center justify-center pt-28">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-white">
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
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-28 pb-16 md:pt-40 md:pb-24 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-4 px-4 py-2 bg-purple-100 rounded-full">
              <span className="text-purple-600 font-semibold text-sm">Мероприятие M.AI.N Community</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 gradient-text flex items-center justify-center gap-4 flex-wrap">
              {event.title.includes("ИИшница") ? (
                <>
                  Вечерняя
                  <img
                    src="/iiishnica.png"
                    alt="ИИшница"
                    className="h-16 md:h-20 lg:h-24 w-auto"
                  />
                  ИИшница
                </>
              ) : (
                event.title
              )}
            </h1>

            {event.description && (
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                {event.description}
              </p>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button
                size="lg"
                className="rounded-full bg-primary hover:bg-primary/90 px-8 py-6 text-base"
                onClick={() => window.open(event.telegram_bot_url || 'https://t.me/maincomby_bot', '_blank')}
              >
                Зарегистрироваться <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Info Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center bg-green-100/50 px-6 py-3 rounded-full">
                <CalendarIcon className="w-6 h-6 text-green-500 mr-3" />
                <div className="text-left">
                  <div className="text-xs text-muted-foreground">Дата</div>
                  <span className="text-lg font-medium text-foreground">{formatDate(event.date)}</span>
                </div>
              </div>
              <div className="flex items-center bg-blue-100/50 px-6 py-3 rounded-full">
                <Clock className="w-6 h-6 text-blue-500 mr-3" />
                <div className="text-left">
                  <div className="text-xs text-muted-foreground">Время</div>
                  <span className="text-lg font-medium text-foreground">{formatTime(event.date)}</span>
                </div>
              </div>
              <div className="flex items-center bg-purple-100/50 px-6 py-3 rounded-full">
                <Wallet className="w-6 h-6 text-purple-500 mr-3" />
                <div className="text-left">
                  <div className="text-xs text-muted-foreground">Стоимость</div>
                  <span className="text-lg font-medium text-foreground">
                    {event.price > 0 ? `${event.price} BYN` : "Бесплатно"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-24 left-10 w-24 h-24 bg-purple-200 rounded-full blur-3xl opacity-60 animate-pulse-slow"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-60 animate-pulse-slow"></div>
      </section>

      {/* About Community Section */}
      <section id="about" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <img
                  src="/Main-logo.webp"
                  alt="M.AI.N Community Logo"
                  className="h-20 w-auto"
                />
              </div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                О <span className="gradient-text">комьюнити</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                M.AI.N — это сообщество энтузиастов и профессионалов в области искусственного интеллекта
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <Card className="border border-purple-100 bg-gradient-to-br from-purple-50 to-white">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white text-2xl mr-4">
                      🎯
                    </div>
                    <h3 className="text-xl font-bold">Наша миссия</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Делать искусственный интеллект доступным и понятным каждому. Мы объединяем специалистов и энтузиастов для обмена опытом и совместного роста.
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-blue-100 bg-gradient-to-br from-blue-50 to-white">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl mr-4">
                      🚀
                    </div>
                    <h3 className="text-xl font-bold">Что мы делаем</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Проводим регулярные митапы, мастер-классы и воркшопы по практическому применению ИИ в бизнесе и повседневной жизни.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="border border-purple-100 bg-gradient-to-r from-purple-50 via-blue-50 to-purple-50">
              <CardContent className="p-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-4">Присоединяйтесь к нам!</h3>
                  <p className="text-lg text-muted-foreground mb-6">
                    Станьте частью растущего комьюнити профессионалов, которые используют ИИ для решения реальных задач
                  </p>
                  <div className="flex flex-wrap justify-center gap-4 mb-6">
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full">
                      <span className="text-2xl">💡</span>
                      <span className="font-medium">Практические кейсы</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full">
                      <span className="text-2xl">🤝</span>
                      <span className="font-medium">Нетворкинг</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full">
                      <span className="text-2xl">📚</span>
                      <span className="font-medium">Обучение</span>
                    </div>
                  </div>

                  <div className="flex justify-center items-center gap-6 pt-4 border-t border-purple-200">
                    <p className="text-sm font-medium text-muted-foreground">Мы в соцсетях:</p>
                    <div className="flex gap-3">
                      <a
                        href="https://t.me/maincomby"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-white hover:bg-blue-500 hover:text-white transition-colors flex items-center justify-center shadow-sm border border-purple-100"
                        aria-label="Telegram"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.242-1.865-.442-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.14.121.098.155.23.171.324.016.094.037.308.02.475z"/>
                        </svg>
                      </a>
                      <a
                        href="https://www.linkedin.com/company/maincomby/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-white hover:bg-blue-700 hover:text-white transition-colors flex items-center justify-center shadow-sm border border-purple-100"
                        aria-label="LinkedIn"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </a>
                      <a
                        href="https://www.instagram.com/maincomby/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-white hover:bg-pink-600 hover:text-white transition-colors flex items-center justify-center shadow-sm border border-purple-100"
                        aria-label="Instagram"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
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
        <section className="py-16 bg-gradient-to-b from-white to-purple-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                Спикеры <span className="gradient-text">мероприятия</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Практические доклады от экспертов в области искусственного интеллекта
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {speakers.map((item) => (
                <Card key={item.speaker_id} className="border border-purple-100 bg-white hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      {item.speaker.photo_url ? (
                        <img
                          src={item.speaker.photo_url}
                          alt={item.speaker.name}
                          className="h-16 w-16 rounded-full object-cover mr-4"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold mr-4">
                          {getInitials(item.speaker.name)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-lg">{item.speaker.name}</h3>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Users className="w-3 h-3 mr-1" />
                          {item.speaker.title || "Спикер"}
                        </div>
                      </div>
                    </div>

                    {item.talk_title && (
                      <h4 className="font-semibold text-primary mb-2">{item.talk_title}</h4>
                    )}
                    {item.talk_description && (
                      <p className="text-sm text-muted-foreground">{item.talk_description}</p>
                    )}
                    {!item.talk_description && item.speaker.description && (
                      <p className="text-sm text-muted-foreground">{item.speaker.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Program Section */}
      {program.length > 0 && (
        <section id="program" className="py-16 bg-gradient-to-b from-white to-purple-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                <span className="gradient-text">Программа</span> мероприятия
              </h2>
              <p className="text-lg text-muted-foreground">
                Детальное расписание вечера с описанием выступлений
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
              {program.map((item) => (
                <Card key={item.id} className="border border-purple-100 bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 font-bold px-4 py-2 rounded-lg text-sm ${
                        item.type === 'networking' ? 'bg-purple-100 text-purple-600' :
                        item.type === 'break' ? 'bg-orange-100 text-orange-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {formatProgramTime(item.time_start, item.time_end)}
                      </div>
                      <div className="flex-1">
                        {item.speaker ? (
                          <>
                            <div className="flex items-center gap-3 mb-3">
                              {item.speaker.photo_url ? (
                                <img
                                  src={item.speaker.photo_url}
                                  alt={item.speaker.name}
                                  className="h-12 w-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                                  {getInitials(item.speaker.name)}
                                </div>
                              )}
                              <div>
                                <h3 className="text-xl font-bold">{item.speaker.name}</h3>
                                <p className="text-sm text-muted-foreground">{item.speaker.title}</p>
                              </div>
                            </div>
                            <h4 className="text-lg font-semibold text-primary mb-3">{item.title}</h4>
                            {item.description && (
                              <p className="text-muted-foreground">{item.description}</p>
                            )}
                          </>
                        ) : (
                          <>
                            <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                            {item.description && (
                              <p className="text-muted-foreground">{item.description}</p>
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

      {/* Sponsors Section */}
      {sponsors.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                <span className="gradient-text">Спонсоры</span> мероприятия
              </h2>
              <p className="text-lg text-muted-foreground">
                Благодарим наших партнёров за поддержку
              </p>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-8 max-w-4xl mx-auto">
              {sponsors.map((sponsor) => (
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
                      className="h-16 md:h-20 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  ) : (
                    <div className="px-6 py-4 bg-gray-100 rounded-lg group-hover:bg-purple-100 transition-colors">
                      <span className="text-lg font-semibold text-gray-700 group-hover:text-purple-700">
                        {sponsor.name}
                      </span>
                    </div>
                  )}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Location Section */}
      {(event.location_name || event.location_address) && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                <span className="gradient-text">Место</span> проведения
              </h2>
              {event.location_name && (
                <p className="text-lg text-muted-foreground mb-2">
                  {event.location_name}
                </p>
              )}
              {event.location_address && (
                <div className="flex items-center justify-center text-muted-foreground">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{event.location_address}</span>
                </div>
              )}
            </div>

            <div className="max-w-4xl mx-auto">
              <EventLocationMap />
            </div>
          </div>
        </section>
      )}

      {/* Registration CTA */}
      <section className="py-16 bg-gradient-to-b from-purple-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="border border-purple-200 bg-gradient-to-r from-purple-100 via-blue-50 to-purple-100">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">
                  Регистрация на мероприятие
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Стоимость участия:{" "}
                  <span className="font-bold text-foreground">
                    {event.price > 0 ? `${event.price} BYN` : "Бесплатно"}
                  </span>
                </p>
                <Button
                  size="lg"
                  className="rounded-full bg-primary hover:bg-primary/90 px-8 py-6 text-base"
                  onClick={() => window.open(event.telegram_bot_url || 'https://t.me/maincomby_bot', '_blank')}
                >
                  Зарегистрироваться в Telegram <ArrowRight className="ml-2 h-5 w-5" />
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
