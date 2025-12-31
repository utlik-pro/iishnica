import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { ru } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EventsConfig, DEFAULT_EVENTS_CONFIG } from "@/types/pageBuilder";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  duration_minutes: number;
  speaker: string | null;
  price: number;
  registration_info: string | null;
}

interface EventsSectionProps {
  config?: EventsConfig;
}

const EventsSection: React.FC<EventsSectionProps> = ({ config }) => {
  const cfg = config ?? DEFAULT_EVENTS_CONFIG;
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventDates, setEventDates] = useState<Date[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .order("date", { ascending: true });

        if (error) throw error;
        setEvents(data || []);

        const dates = (data || []).map(event => new Date(event.date));
        setEventDates(dates);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const openRegistrationDialog = (event: Event) => {
    setSelectedEvent(event);
    setOpenDialog(true);
  };

  const handleRegister = async (event: Event) => {
    toast({
      title: "Действие недоступно",
      description: "Пожалуйста, воспользуйтесь формой ниже для регистрации",
    });
    setOpenDialog(false);

    const registerSection = document.getElementById("register");
    if (registerSection) {
      registerSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) {
      return `${remainingMinutes} мин.`;
    } else if (remainingMinutes === 0) {
      return `${hours} ч.`;
    } else {
      return `${hours} ч. ${remainingMinutes} мин.`;
    }
  };

  if (loading) {
    return (
      <section id="events" className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm md:text-base">Загрузка расписания...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="events" className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-3 md:mb-4">
            {cfg.title.prefix} <span className="gradient-text">{cfg.title.highlight}</span>
          </h2>
          <p className="text-sm md:text-lg text-muted-foreground px-2">
            {cfg.description}
          </p>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-8 md:py-12">
            <p className="text-base md:text-lg text-muted-foreground">В данный момент нет запланированных мероприятий.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-12">
            {events.slice(0, cfg.maxItems).map((event, index) => (
              <Card key={event.id} className="border border-purple-100">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between mb-3 md:mb-4 gap-2">
                    <div className="bg-primary/10 text-primary font-medium py-1 px-2.5 md:px-3 rounded-full text-xs md:text-sm whitespace-nowrap">
                      {index === 0 ? "Ближайший" : `${index + 1}-й`}
                    </div>
                    <div className="text-xs md:text-sm text-muted-foreground truncate">
                      {formatTime(event.date)} ({formatDuration(event.duration_minutes)})
                    </div>
                  </div>

                  <h3 className="text-lg md:text-xl font-bold mb-1.5 md:mb-2 line-clamp-2">
                    {event.title}
                  </h3>

                  <div className="text-base md:text-lg mb-3 md:mb-4">
                    {formatDate(event.date)}
                  </div>

                  {event.speaker && (
                    <div className="mb-3 md:mb-4 text-xs md:text-sm">
                      <span className="font-medium">Спикер:</span> {event.speaker}
                    </div>
                  )}

                  <p className="text-xs md:text-base text-muted-foreground mb-4 md:mb-6 line-clamp-3">
                    {event.description}
                  </p>

                  <Button className="w-full text-sm md:text-base" onClick={() => handleRegister(event)}>
                    Зарегистрироваться
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-center justify-center">
          {/* Calendar - hide on mobile, show on tablet+ */}
          {cfg.showCalendar && (
            <div className="hidden sm:block sm:w-auto">
              <Calendar
                locale={ru}
                mode="multiple"
                selected={eventDates}
                className="rounded-md border shadow p-2 md:p-4 bg-white select-none pointer-events-auto"
              />
            </div>
          )}

          <div className="w-full sm:w-auto lg:w-1/3 text-center lg:text-left">
            <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">{cfg.sidebarTitle}</h3>
            <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
              {cfg.sidebarDescription}
            </p>
            <p className="text-sm md:text-base text-muted-foreground mb-4" dangerouslySetInnerHTML={{ __html: cfg.priceInfo }} />
            <Button variant="outline" className="w-full sm:w-auto text-sm md:text-base">
              {cfg.buttonText}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
