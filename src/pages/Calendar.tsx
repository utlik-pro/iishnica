import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, MapPin, Clock, Users } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  duration_minutes: number;
  price: number;
  location_name: string | null;
  location_address: string | null;
  telegram_bot_url: string | null;
  is_published: boolean;
}

const MONTHS_RU = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
];

const WEEKDAYS_RU = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const Calendar: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("is_published", true)
        .order("date", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Get the day of the week for the first day (0 = Sunday, 1 = Monday, ...)
    let startingDay = firstDay.getDay();
    // Convert to Monday-based week (0 = Monday, 6 = Sunday)
    startingDay = startingDay === 0 ? 6 : startingDay - 1;

    return { daysInMonth, startingDay };
  };

  const getEventsForDate = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dateStr = new Date(year, month, day).toDateString();

    return events.filter((event) => {
      const eventDate = new Date(event.date).toDateString();
      return eventDate === dateStr;
    });
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate);
  const totalCells = Math.ceil((daysInMonth + startingDay) / 7) * 7;
  const today = new Date();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Календарь событий
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Выберите интересующее вас мероприятие и зарегистрируйтесь
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <Button
                variant="ghost"
                onClick={prevMonth}
                className="text-white hover:bg-white/20"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-2xl font-bold text-white">
                {MONTHS_RU[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <Button
                variant="ghost"
                onClick={nextMonth}
                className="text-white hover:bg-white/20"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : (
              <>
                {/* Calendar Grid */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
                  {/* Weekday Headers */}
                  <div className="grid grid-cols-7 bg-white/5">
                    {WEEKDAYS_RU.map((day) => (
                      <div
                        key={day}
                        className="p-3 text-center text-sm font-medium text-gray-300 border-b border-white/10"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Days Grid */}
                  <div className="grid grid-cols-7">
                    {Array.from({ length: totalCells }, (_, i) => {
                      const dayNumber = i - startingDay + 1;
                      const isValidDay = dayNumber > 0 && dayNumber <= daysInMonth;
                      const dayEvents = isValidDay ? getEventsForDate(dayNumber) : [];
                      const isToday =
                        isValidDay &&
                        today.getDate() === dayNumber &&
                        today.getMonth() === currentDate.getMonth() &&
                        today.getFullYear() === currentDate.getFullYear();

                      return (
                        <div
                          key={i}
                          className={`min-h-[100px] p-2 border-b border-r border-white/10 ${
                            !isValidDay ? "bg-white/5" : ""
                          } ${isToday ? "bg-purple-500/20" : ""}`}
                        >
                          {isValidDay && (
                            <>
                              <span
                                className={`text-sm ${
                                  isToday
                                    ? "text-purple-400 font-bold"
                                    : "text-gray-400"
                                }`}
                              >
                                {dayNumber}
                              </span>
                              <div className="mt-1 space-y-1">
                                {dayEvents.map((event) => (
                                  <button
                                    key={event.id}
                                    onClick={() => setSelectedEvent(event)}
                                    className="w-full text-left p-1 text-xs bg-purple-600 hover:bg-purple-500 text-white rounded truncate transition-colors"
                                  >
                                    {formatTime(event.date)} {event.title}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Upcoming Events List */}
                <div className="mt-12">
                  <h3 className="text-2xl font-bold text-white mb-6">
                    Ближайшие события
                  </h3>
                  {events.filter((e) => new Date(e.date) >= today).length === 0 ? (
                    <p className="text-gray-400 text-center py-8">
                      Нет запланированных событий
                    </p>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {events
                        .filter((e) => new Date(e.date) >= today)
                        .slice(0, 6)
                        .map((event) => (
                          <Card
                            key={event.id}
                            className="bg-white/10 border-white/20 hover:bg-white/15 transition-colors cursor-pointer"
                            onClick={() => setSelectedEvent(event)}
                          >
                            <CardContent className="p-4">
                              <h4 className="font-semibold text-white mb-2 line-clamp-2">
                                {event.title}
                              </h4>
                              <div className="space-y-1 text-sm text-gray-300">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  {formatFullDate(event.date)}
                                </div>
                                {event.location_name && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    {event.location_name}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Event Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-gray-800 rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              {selectedEvent.title}
            </h2>

            <div className="space-y-4 text-gray-300">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-purple-400" />
                <div>
                  <p className="font-medium">{formatFullDate(selectedEvent.date)}</p>
                  <p className="text-sm text-gray-400">
                    Начало в {formatTime(selectedEvent.date)}, продолжительность{" "}
                    {selectedEvent.duration_minutes} мин
                  </p>
                </div>
              </div>

              {selectedEvent.location_name && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-purple-400" />
                  <div>
                    <p className="font-medium">{selectedEvent.location_name}</p>
                    {selectedEvent.location_address && (
                      <p className="text-sm text-gray-400">
                        {selectedEvent.location_address}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {selectedEvent.description && (
                <div>
                  <p className="text-sm">{selectedEvent.description}</p>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-purple-400" />
                <p>
                  Стоимость:{" "}
                  <span className="font-medium">
                    {selectedEvent.price > 0
                      ? `${selectedEvent.price} BYN`
                      : "Бесплатно"}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSelectedEvent(null)}
              >
                Закрыть
              </Button>
              <Button
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                onClick={() => navigate(`/event/${selectedEvent.id}`)}
              >
                Подробнее
              </Button>
              {selectedEvent.telegram_bot_url && (
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() =>
                    window.open(selectedEvent.telegram_bot_url!, "_blank")
                  }
                >
                  Регистрация
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Calendar;
