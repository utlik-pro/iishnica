import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, Clock, CheckCircle, XCircle, Loader2, RefreshCw, Users } from "lucide-react";

interface Broadcast {
  id: string;
  title: string;
  message_text: string;
  message_type: "text" | "event_notification" | "poll";
  target_type: "all" | "event_registered" | "event_not_registered" | "custom";
  target_event_id: string | null;
  status: "pending" | "in_progress" | "completed" | "failed" | "cancelled";
  scheduled_for: string | null;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
}

interface Event {
  id: string;
  title: string;
  date: string;
  is_published: boolean;
}

const BroadcastManager: React.FC = () => {
  const { toast } = useToast();
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);

  const [form, setForm] = useState({
    title: "",
    message_text: "",
    target_type: "all" as "all" | "event_registered" | "event_not_registered" | "custom",
    target_event_id: "",
  });

  useEffect(() => {
    fetchBroadcasts();
    fetchEvents();
  }, []);

  const fetchBroadcasts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("broadcast_queue")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBroadcasts((data as Broadcast[]) || []);
    } catch (error) {
      console.error("Error fetching broadcasts:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить рассылки",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, date, is_published")
        .eq("is_published", true)
        .order("date", { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const openCreateDialog = () => {
    setForm({
      title: "",
      message_text: "",
      target_type: "all",
      target_event_id: "",
    });
    setOpenDialog(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const broadcastData = {
        title: form.title,
        message_text: form.message_text,
        message_type: "text" as const,
        target_type: form.target_type,
        target_event_id: form.target_event_id || null,
        status: "pending" as const,
      };

      const { error } = await supabase
        .from("broadcast_queue")
        .insert([broadcastData]);

      if (error) throw error;

      toast({
        title: "Рассылка создана",
        description: "Бот отправит сообщения при следующей синхронизации (до 60 сек)",
      });

      setOpenDialog(false);
      fetchBroadcasts();
    } catch (error) {
      console.error("Error creating broadcast:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать рассылку",
        variant: "destructive",
      });
    }
  };

  const handleCancel = async (broadcastId: string) => {
    if (!confirm("Отменить эту рассылку?")) return;

    try {
      const { error } = await supabase
        .from("broadcast_queue")
        .update({ status: "cancelled" })
        .eq("id", broadcastId)
        .eq("status", "pending");

      if (error) throw error;

      toast({
        title: "Отменено",
        description: "Рассылка отменена",
      });

      fetchBroadcasts();
    } catch (error) {
      console.error("Error cancelling broadcast:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось отменить рассылку",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: Broadcast["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
            <Clock className="w-3 h-3 mr-1" />
            Ожидает
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Отправляется
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Завершено
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Ошибка
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="secondary">
            Отменено
          </Badge>
        );
    }
  };

  const getTargetLabel = (broadcast: Broadcast) => {
    switch (broadcast.target_type) {
      case "all":
        return "Все пользователи";
      case "event_registered":
        const regEvent = events.find(e => e.id === broadcast.target_event_id);
        return `Зарегистрированные: ${regEvent?.title || "..."}`;
      case "event_not_registered":
        const notRegEvent = events.find(e => e.id === broadcast.target_event_id);
        return `Не зарегистрированные: ${notRegEvent?.title || "..."}`;
      case "custom":
        return "Выбранные пользователи";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ru-RU", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Рассылки</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchBroadcasts}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Обновить
          </Button>
          <Button onClick={openCreateDialog}>
            <Send className="w-4 h-4 mr-2" />
            Новая рассылка
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : broadcasts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Send className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Нет рассылок. Создайте первую!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {broadcasts.map((broadcast) => (
            <Card key={broadcast.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{broadcast.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDate(broadcast.created_at)}
                    </p>
                  </div>
                  {getStatusBadge(broadcast.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm whitespace-pre-wrap">{broadcast.message_text}</p>
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{getTargetLabel(broadcast)}</span>
                  </div>

                  {broadcast.status === "completed" && (
                    <div className="flex gap-3">
                      <span className="text-green-600">
                        Отправлено: {broadcast.sent_count}
                      </span>
                      {broadcast.failed_count > 0 && (
                        <span className="text-red-600">
                          Ошибок: {broadcast.failed_count}
                        </span>
                      )}
                    </div>
                  )}

                  {broadcast.status === "in_progress" && broadcast.total_recipients > 0 && (
                    <span className="text-muted-foreground">
                      {broadcast.sent_count} / {broadcast.total_recipients}
                    </span>
                  )}
                </div>

                {broadcast.error_message && (
                  <p className="text-sm text-red-600">{broadcast.error_message}</p>
                )}

                {broadcast.status === "pending" && (
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancel(broadcast.id)}
                    >
                      Отменить
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Новая рассылка</DialogTitle>
            <DialogDescription>
              Создайте рассылку для пользователей Telegram бота
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название (для себя)</Label>
              <Input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Например: Анонс нового мероприятия"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message_text">Текст сообщения</Label>
              <Textarea
                id="message_text"
                name="message_text"
                value={form.message_text}
                onChange={handleChange}
                placeholder="Текст, который получат пользователи..."
                rows={6}
                required
              />
              <p className="text-xs text-muted-foreground">
                Поддерживается HTML: &lt;b&gt;жирный&lt;/b&gt;, &lt;i&gt;курсив&lt;/i&gt;, &lt;a href="..."&gt;ссылка&lt;/a&gt;
              </p>
            </div>

            <div className="space-y-2">
              <Label>Кому отправить</Label>
              <Select
                value={form.target_type}
                onValueChange={(value: "all" | "event_registered" | "event_not_registered") =>
                  setForm({ ...form, target_type: value, target_event_id: "" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Всем пользователям бота</SelectItem>
                  <SelectItem value="event_registered">
                    Зарегистрированным на мероприятие
                  </SelectItem>
                  <SelectItem value="event_not_registered">
                    НЕ зарегистрированным на мероприятие
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(form.target_type === "event_registered" ||
              form.target_type === "event_not_registered") && (
              <div className="space-y-2">
                <Label>Выберите мероприятие</Label>
                <Select
                  value={form.target_event_id}
                  onValueChange={(value) =>
                    setForm({ ...form, target_event_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите мероприятие..." />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm font-medium mb-2">Предпросмотр:</p>
              <div
                className="text-sm whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: form.message_text || "Введите текст сообщения...",
                }}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenDialog(false)}
              >
                Отмена
              </Button>
              <Button type="submit">
                <Send className="w-4 h-4 mr-2" />
                Отправить
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BroadcastManager;
