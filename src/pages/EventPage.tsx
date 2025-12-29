import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Users, ArrowLeft } from "lucide-react";

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

const EventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [speakers, setSpeakers] = useState<EventSpeaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchEvent(id);
    }
  }, [id]);

  const fetchEvent = async (eventId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch event
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (eventError) {
        if (eventError.code === "PGRST116") {
          setError("Мероприятие не найдено");
        } else {
          throw eventError;
        }
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
        .eq("event_id", eventId)
        .order("order_index");

      if (speakersError) throw speakersError;

      // Type assertion for the nested speaker data
      const formattedSpeakers = (speakersData || []).map((item: any) => ({
        speaker_id: item.speaker_id,
        talk_title: item.talk_title,
        talk_description: item.talk_description,
        order_index: item.order_index,
        speaker: item.speaker,
      }));

      setSpeakers(formattedSpeakers);
    } catch (err) {
      console.error("Error fetching event:", err);
      setError("Ошибка загрузки мероприятия");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-4">
              {error || "Мероприятие не найдено"}
            </h1>
            <Button onClick={() => navigate("/calendar")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Вернуться к календарю
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Back button */}
          <Button
            variant="ghost"
            className="text-gray-400 hover:text-white mb-6"
            onClick={() => navigate("/calendar")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к календарю
          </Button>

          {/* Event Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {event.title}
            </h1>

            <div className="flex flex-wrap justify-center gap-4 text-gray-300">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                <Calendar className="h-5 w-5 text-purple-400" />
                {formatDate(event.date)}
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                <Clock className="h-5 w-5 text-purple-400" />
                {formatTime(event.date)}
              </div>
              {event.location_name && (
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <MapPin className="h-5 w-5 text-purple-400" />
                  {event.location_name}
                </div>
              )}
            </div>
          </div>

          <div className="max-w-4xl mx-auto space-y-12">
            {/* Description */}
            {event.description && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">О мероприятии</h2>
                <p className="text-gray-300 text-lg leading-relaxed">
                  {event.description}
                </p>
              </section>
            )}

            {/* Speakers */}
            {speakers.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-6">Спикеры</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {speakers.map((item) => (
                    <Card
                      key={item.speaker_id}
                      className="bg-white/10 border-white/20"
                    >
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          {item.speaker.photo_url ? (
                            <img
                              src={item.speaker.photo_url}
                              alt={item.speaker.name}
                              className="w-20 h-20 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center">
                              <Users className="h-8 w-8 text-white" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-white">
                              {item.speaker.name}
                            </h3>
                            {item.speaker.title && (
                              <p className="text-purple-400 text-sm">
                                {item.speaker.title}
                              </p>
                            )}
                            {item.talk_title && (
                              <p className="text-gray-300 mt-2 font-medium">
                                {item.talk_title}
                              </p>
                            )}
                            {item.talk_description && (
                              <p className="text-gray-400 text-sm mt-1">
                                {item.talk_description}
                              </p>
                            )}
                          </div>
                        </div>
                        {item.speaker.description && (
                          <p className="text-gray-400 text-sm mt-4">
                            {item.speaker.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Location */}
            {(event.location_name || event.yandex_map_url) && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Место проведения</h2>
                <Card className="bg-white/10 border-white/20">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <MapPin className="h-6 w-6 text-purple-400 mt-1" />
                      <div>
                        {event.location_name && (
                          <h3 className="text-xl font-semibold text-white">
                            {event.location_name}
                          </h3>
                        )}
                        {event.location_address && (
                          <p className="text-gray-300">{event.location_address}</p>
                        )}
                      </div>
                    </div>
                    {event.yandex_map_url && (
                      <div className="mt-4">
                        <a
                          href={event.yandex_map_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:text-purple-300 underline"
                        >
                          Открыть на Яндекс.Картах
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Registration */}
            <section className="text-center">
              <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/30">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Регистрация на мероприятие
                  </h2>
                  <p className="text-gray-300 mb-4">
                    Стоимость участия:{" "}
                    <span className="font-bold text-white">
                      {event.price > 0 ? `${event.price} BYN` : "Бесплатно"}
                    </span>
                  </p>
                  <p className="text-gray-400 text-sm mb-6">
                    Продолжительность: {event.duration_minutes} минут
                  </p>
                  {event.telegram_bot_url ? (
                    <Button
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                      onClick={() => window.open(event.telegram_bot_url!, "_blank")}
                    >
                      Зарегистрироваться в Telegram
                    </Button>
                  ) : (
                    <p className="text-gray-400">
                      Регистрация временно недоступна
                    </p>
                  )}
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EventPage;
