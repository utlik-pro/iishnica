import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, DollarSign, RefreshCw } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  duration_minutes: number;
  speaker: string | null;
  price: number;
  location: string | null;
  is_visible_in_miniapp: boolean;
}

export function MiniappEventsManager() {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить события",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleMiniappVisibility = async (eventId: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from("events")
        .update({ is_visible_in_miniapp: !currentValue })
        .eq("id", eventId);

      if (error) throw error;

      toast({
        title: !currentValue ? "Событие показано" : "Событие скрыто",
        description: !currentValue
          ? "Событие теперь доступно в miniapp"
          : "Событие скрыто из miniapp",
      });

      fetchEvents();
    } catch (error) {
      console.error("Error toggling visibility:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось изменить видимость события",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
    return <div className="p-4">Загрузка событий...</div>;
  }

  const visibleCount = events.filter(e => e.is_visible_in_miniapp).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">События в Mini-App</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Управление доступностью событий в Telegram Mini-App
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline">
            {visibleCount} из {events.length} доступно
          </Badge>
          <Button variant="outline" size="sm" onClick={fetchEvents}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Обновить
          </Button>
        </div>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800 text-base">Как это работает</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-900 space-y-2">
          <p>• Включите переключатель, чтобы событие отображалось в miniapp</p>
          <p>• Пользователи смогут зарегистрироваться на событие через miniapp</p>
          <p>• Регистрации будут сохраняться в таблицу <code className="bg-blue-100 px-1 rounded">leads</code> с <code className="bg-blue-100 px-1 rounded">source='miniapp'</code></p>
        </CardContent>
      </Card>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Доступно</TableHead>
              <TableHead>Событие</TableHead>
              <TableHead>Дата и время</TableHead>
              <TableHead>Локация</TableHead>
              <TableHead>Стоимость</TableHead>
              <TableHead>Спикер</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Нет созданных событий
                </TableCell>
              </TableRow>
            ) : (
              events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <Switch
                      checked={event.is_visible_in_miniapp || false}
                      onCheckedChange={() =>
                        toggleMiniappVisibility(event.id, event.is_visible_in_miniapp || false)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{event.title}</div>
                      {event.description && (
                        <div className="text-sm text-muted-foreground line-clamp-1 mt-1">
                          {event.description}
                        </div>
                      )}
                      {event.is_visible_in_miniapp && (
                        <Badge variant="secondary" className="mt-1">
                          В miniapp
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div>{formatDate(event.date)}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDuration(event.duration_minutes)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {event.location ? (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {event.location}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{event.price} BYN</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {event.speaker || <span className="text-muted-foreground text-sm">-</span>}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
