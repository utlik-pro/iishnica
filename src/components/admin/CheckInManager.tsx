import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckInScanner } from "./CheckInScanner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserCheck, TrendingUp, Users, Calendar } from "lucide-react";

interface CheckInHistory {
  id: number;
  ticket_code: string;
  checked_in_at: string;
  bot_users: {
    first_name: string | null;
    last_name: string | null;
    username: string | null;
  } | null;
  bot_events: {
    title: string;
    event_date: string;
  } | null;
}

interface CheckInStats {
  total: number;
  checked_in: number;
  pending: number;
  today: number;
}

export function CheckInManager() {
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<'admin' | 'volunteer' | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [recentCheckIns, setRecentCheckIns] = useState<CheckInHistory[]>([]);
  const [stats, setStats] = useState<CheckInStats>({
    total: 0,
    checked_in: 0,
    pending: 0,
    today: 0,
  });
  const [eventFilter, setEventFilter] = useState<number | "all">("all");
  const [events, setEvents] = useState<{id: number, title: string}[]>([]);

  useEffect(() => {
    checkUserRole();
    fetchEvents();
    fetchStats();
    fetchRecentCheckIns();
  }, []);

  useEffect(() => {
    fetchStats();
    fetchRecentCheckIns();
  }, [eventFilter]);

  const checkUserRole = async () => {
    setLoading(true);
    try {
      // Получить текущего пользователя из localStorage
      const token = localStorage.getItem("admin_token");
      if (!token) {
        setLoading(false);
        return;
      }

      // TODO: В будущем проверять роль через admin_roles таблицу
      // Сейчас: все залогиненные админы имеют роль 'admin'
      setUserRole('admin');
      setCurrentUserId(1); // TODO: получить реальный ID из связи admins <-> bot_users

      toast({
        title: "Доступ разрешен",
        description: "Вы можете выполнять чекин участников",
      });
    } catch (error) {
      console.error("Error checking user role:", error);
      toast({
        title: "Ошибка проверки прав",
        description: "Не удалось проверить права доступа",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("bot_events")
        .select("id, title")
        .order("event_date", { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const fetchStats = async () => {
    try {
      let query = supabase
        .from("bot_registrations")
        .select("id, checked_in_at, status");

      if (eventFilter !== "all") {
        query = query.eq("event_id", eventFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      const total = (data || []).length;
      const checked_in = (data || []).filter(r => r.checked_in_at !== null).length;
      const pending = total - checked_in;

      // Подсчет чекинов за сегодня
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayCheckins = (data || []).filter(r => {
        if (!r.checked_in_at) return false;
        const checkinDate = new Date(r.checked_in_at);
        return checkinDate >= today;
      }).length;

      setStats({
        total,
        checked_in,
        pending,
        today: todayCheckins,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchRecentCheckIns = async () => {
    try {
      let query = supabase
        .from("bot_registrations")
        .select(`
          id,
          ticket_code,
          checked_in_at,
          bot_users!bot_registrations_user_id_fkey (
            first_name,
            last_name,
            username
          ),
          bot_events (
            title,
            event_date
          )
        `)
        .not("checked_in_at", "is", null)
        .order("checked_in_at", { ascending: false })
        .limit(10);

      if (eventFilter !== "all") {
        query = query.eq("event_id", eventFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRecentCheckIns(data as CheckInHistory[] || []);
    } catch (error) {
      console.error("Error fetching recent check-ins:", error);
    }
  };

  const handleCheckInComplete = () => {
    // Обновить статистику и список после успешного чекина
    fetchStats();
    fetchRecentCheckIns();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!userRole) {
    return (
      <div className="p-8">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-900">Доступ ограничен</CardTitle>
            <CardDescription className="text-yellow-700">
              У вас нет прав для выполнения чекина участников
            </CardDescription>
          </CardHeader>
          <CardContent className="text-yellow-800">
            <p>Чтобы получить доступ, обратитесь к администратору системы.</p>
            <p className="mt-2 text-sm">
              Необходимая роль: <Badge variant="outline">admin</Badge> или <Badge variant="outline">volunteer</Badge>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Чекин участников</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Сканируйте QR-код билета или введите код вручную для отметки посещения
        </p>
      </div>

      {/* Статистика */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего регистраций</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Участников зарегистрировано</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Отмечено</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.checked_in}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.checked_in / stats.total) * 100) : 0}% от общего числа
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ожидают</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Еще не отмечены</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Сегодня</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.today}</div>
            <p className="text-xs text-muted-foreground">Отмечено за сегодня</p>
          </CardContent>
        </Card>
      </div>

      {/* Фильтр по событиям */}
      {events.length > 0 && (
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Фильтр по событию:</label>
          <Select value={eventFilter.toString()} onValueChange={(v) => setEventFilter(v === "all" ? "all" : parseInt(v))}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Выберите событие" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все события</SelectItem>
              {events.map(event => (
                <SelectItem key={event.id} value={event.id.toString()}>
                  {event.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Сканер чекина */}
      <CheckInScanner
        userRole={userRole}
        currentUserId={currentUserId}
        onCheckInComplete={handleCheckInComplete}
      />

      {/* История чекинов */}
      <Card>
        <CardHeader>
          <CardTitle>Последние чекины</CardTitle>
          <CardDescription>
            История последних 10 отмеченных участников
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentCheckIns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Пока нет чекинов
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Время</TableHead>
                    <TableHead>Участник</TableHead>
                    <TableHead>Код билета</TableHead>
                    <TableHead>Событие</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentCheckIns.map((checkIn) => (
                    <TableRow key={checkIn.id}>
                      <TableCell className="font-medium">
                        {formatDate(checkIn.checked_in_at)}
                      </TableCell>
                      <TableCell>
                        {checkIn.bot_users?.first_name || checkIn.bot_users?.username || 'Без имени'}
                        {checkIn.bot_users?.last_name && ` ${checkIn.bot_users.last_name}`}
                      </TableCell>
                      <TableCell>
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                          {checkIn.ticket_code}
                        </code>
                      </TableCell>
                      <TableCell>
                        {checkIn.bot_events?.title || '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
