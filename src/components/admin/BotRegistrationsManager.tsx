import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Check, X, Bell } from "lucide-react";

type BotRegistration = {
  id: number;
  event_id: number;
  user_id: number;
  registered_at: string;
  status: string;
  notes: string | null;
  confirmed: boolean;
  reminder_sent: boolean;
  bot_events: {
    title: string;
    event_date: string;
  } | null;
  bot_users: {
    username: string | null;
    first_name: string | null;
    last_name: string | null;
    tg_user_id: number;
  } | null;
};

type BotEvent = {
  id: number;
  title: string;
  event_date: string;
};

const statusLabels: Record<string, string> = {
  registered: "Зарегистрирован",
  cancelled: "Отменен",
  attended: "Присутствовал",
};

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  registered: "default",
  cancelled: "destructive",
  attended: "secondary",
};

export function BotRegistrationsManager() {
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<string>("all");

  const { data: events } = useQuery({
    queryKey: ["bot_events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bot_events")
        .select("id, title, event_date")
        .order("event_date", { ascending: false });
      if (error) throw error;
      return data as BotEvent[];
    },
  });

  const { data: registrations, isLoading, refetch } = useQuery({
    queryKey: ["bot_registrations", selectedEvent],
    queryFn: async () => {
      let query = supabase
        .from("bot_registrations")
        .select(`
          *,
          bot_events (title, event_date),
          bot_users (username, first_name, last_name, tg_user_id)
        `)
        .order("registered_at", { ascending: false });

      if (selectedEvent !== "all") {
        query = query.eq("event_id", parseInt(selectedEvent));
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as BotRegistration[];
    },
  });

  const filteredRegistrations = registrations?.filter((reg) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      reg.bot_users?.username?.toLowerCase().includes(searchLower) ||
      reg.bot_users?.first_name?.toLowerCase().includes(searchLower) ||
      reg.bot_users?.last_name?.toLowerCase().includes(searchLower) ||
      reg.bot_events?.title?.toLowerCase().includes(searchLower)
    );
  });

  const updateStatus = async (regId: number, newStatus: string) => {
    const { error } = await supabase
      .from("bot_registrations")
      .update({ status: newStatus })
      .eq("id", regId);
    if (!error) {
      refetch();
    }
  };

  const toggleConfirmed = async (regId: number, current: boolean) => {
    const { error } = await supabase
      .from("bot_registrations")
      .update({ confirmed: !current })
      .eq("id", regId);
    if (!error) {
      refetch();
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return <div className="p-4">Загрузка...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Регистрации на мероприятия (бот)</h2>
        <Badge variant="outline">{registrations?.length || 0} регистраций</Badge>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Поиск по имени пользователя или мероприятию..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedEvent} onValueChange={setSelectedEvent}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Фильтр по мероприятию" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все мероприятия</SelectItem>
            {events?.map((event) => (
              <SelectItem key={event.id} value={event.id.toString()}>
                {event.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Пользователь</TableHead>
              <TableHead>Мероприятие</TableHead>
              <TableHead>Дата регистрации</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Подтверждено</TableHead>
              <TableHead>Напоминание</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRegistrations?.map((reg) => (
              <TableRow key={reg.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {reg.bot_users?.first_name} {reg.bot_users?.last_name}
                    </div>
                    {reg.bot_users?.username && (
                      <div className="text-sm text-gray-500">
                        @{reg.bot_users.username}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{reg.bot_events?.title}</div>
                    <div className="text-sm text-gray-500">
                      {reg.bot_events?.event_date && formatDate(reg.bot_events.event_date)}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{formatDate(reg.registered_at)}</TableCell>
                <TableCell>
                  <Select
                    value={reg.status}
                    onValueChange={(value) => updateStatus(reg.id, value)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <Badge variant={statusColors[reg.status] || "default"}>
                        {statusLabels[reg.status] || reg.status}
                      </Badge>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="registered">Зарегистрирован</SelectItem>
                      <SelectItem value="cancelled">Отменен</SelectItem>
                      <SelectItem value="attended">Присутствовал</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button
                    variant={reg.confirmed ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleConfirmed(reg.id, reg.confirmed)}
                  >
                    {reg.confirmed ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </Button>
                </TableCell>
                <TableCell>
                  {reg.reminder_sent ? (
                    <Badge variant="secondary">
                      <Bell className="h-3 w-3 mr-1" />
                      Отправлено
                    </Badge>
                  ) : (
                    <Badge variant="outline">Не отправлено</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {reg.notes && (
                    <span className="text-sm text-gray-500" title={reg.notes}>
                      Заметка
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
