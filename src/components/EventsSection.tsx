import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { ru } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

const EventsSection = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventDates, setEventDates] = useState<Date[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Загружаем данные о мероприятиях из базы
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .order("date", { ascending: true });
        
        if (error) throw error;
        setEvents(data || []);
        
        // Устанавливаем даты для календаря
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
    // Здесь можно было бы добавить перенаправление на форму регистрации с параметрами
    // или другую логику обработки регистрации
    toast({
      title: "Действие недоступно",
      description: "Пожалуйста, воспользуйтесь формой ниже для регистрации",
    });
    setOpenDialog(false);
    
    // Прокрутка к форме регистрации
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

  // Вычисляем продолжительность в часах и минутах
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
      <section id="events" className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <p>Загрузка расписания...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="events" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Расписание ближайших <span className="gradient-text">завтраков</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Присоединяйтесь к нашим еженедельным встречам каждый вторник с 10:00 до 12:00
          </p>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">В данный момент нет запланированных мероприятий.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {events.slice(0, 3).map((event, index) => (
              <Card key={event.id} className="border border-purple-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-primary/10 text-primary font-medium py-1 px-3 rounded-full text-sm">
                      {index === 0 ? "Ближайший" : `${index + 1}-й в очереди`}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatTime(event.date)} ({formatDuration(event.duration_minutes)})
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-2">
                    {event.title}
                  </h3>

                  <div className="text-lg mb-4">
                    {formatDate(event.date)}
                  </div>

                  {event.speaker && (
                    <div className="mb-4 text-sm">
                      <span className="font-medium">Спикер:</span> {event.speaker}
                    </div>
                  )}

                  <p className="text-muted-foreground mb-6 line-clamp-3">
                    {event.description}
                  </p>

                  <Button className="w-full" onClick={() => handleRegister(event)}>Зарегистрироваться</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
          <div className="md:w-1/2 lg:w-1/3">
            <Calendar
              locale={ru}
              mode="multiple"
              selected={eventDates}
              className="rounded-md border shadow p-4 bg-white select-none pointer-events-auto"
            />
          </div>

          <div className="md:w-1/2 lg:w-1/3">
            <h3 className="text-xl font-bold mb-4">Регулярные встречи</h3>
            <p className="text-muted-foreground mb-4">
              Наши завтраки проходят каждый вторник с 10:00 до 12:00. Каждая встреча посвящена решению конкретной задачи с использованием инструментов искусственного интеллекта.
            </p>
            <p className="text-muted-foreground mb-4">
              Стоимость участия в одном завтраке — <strong>25 BYN</strong>.
            </p>
            <Button variant="outline" className="w-full">
              Посмотреть все мероприятия
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
