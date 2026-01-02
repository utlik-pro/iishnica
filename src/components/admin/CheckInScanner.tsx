import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { QrCode, Search, CheckCircle, XCircle, Clock } from "lucide-react";

interface BotRegistration {
  id: number;
  event_id: number;
  user_id: number;
  ticket_code: string;
  status: string;
  registered_at: string;
  checked_in_at: string | null;
  checked_in_by: number | null;
  bot_users: {
    id: number;
    username: string | null;
    first_name: string | null;
    last_name: string | null;
    phone_number: string | null;
  } | null;
  bot_events: {
    id: number;
    title: string;
    event_date: string;
  } | null;
}

interface CheckInScannerProps {
  userRole: 'admin' | 'volunteer' | null;
  currentUserId: number | null;
  onCheckInComplete?: () => void;
}

export function CheckInScanner({ userRole, currentUserId, onCheckInComplete }: CheckInScannerProps) {
  const { toast } = useToast();
  const [ticketCode, setTicketCode] = useState("");
  const [searching, setSearching] = useState(false);
  const [registration, setRegistration] = useState<BotRegistration | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSearch = async () => {
    if (!ticketCode.trim()) {
      toast({
        title: "Введите код билета",
        description: "Пожалуйста, введите код билета для поиска",
        variant: "destructive",
      });
      return;
    }

    setSearching(true);
    try {
      // 1. Найти регистрацию по ticket_code
      const { data, error } = await supabase
        .from("bot_registrations")
        .select(`
          *,
          bot_users!bot_registrations_user_id_fkey (
            id,
            username,
            first_name,
            last_name,
            phone_number
          ),
          bot_events (
            id,
            title,
            event_date
          )
        `)
        .eq("ticket_code", ticketCode.trim().toUpperCase())
        .single();

      if (error || !data) {
        toast({
          title: "Билет не найден",
          description: "Билет с таким кодом не существует в системе",
          variant: "destructive",
        });
        return;
      }

      // 2. Проверить, не был ли уже чекин
      if (data.checked_in_at) {
        toast({
          title: "Билет уже отмечен",
          description: `Чекин выполнен: ${formatDate(data.checked_in_at)}`,
          variant: "destructive",
        });
        setRegistration(data as BotRegistration);
        return;
      }

      // 3. Проверить время события (за 1 час до начала)
      if (data.bot_events) {
        const eventDate = new Date(data.bot_events.event_date);
        const oneHourBefore = new Date(eventDate.getTime() - 60 * 60 * 1000);
        const now = new Date();

        if (now < oneHourBefore) {
          toast({
            title: "Слишком рано",
            description: `Чекин доступен за 1 час до начала события (${formatDate(oneHourBefore.toISOString())})`,
            variant: "destructive",
          });
          return;
        }
      }

      // 4. Показать подтверждение
      setRegistration(data as BotRegistration);
      setConfirmDialogOpen(true);
    } catch (error) {
      console.error("Error searching ticket:", error);
      toast({
        title: "Ошибка поиска",
        description: "Не удалось найти билет. Попробуйте еще раз.",
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  const confirmCheckIn = async () => {
    if (!registration || !currentUserId) {
      toast({
        title: "Ошибка",
        description: "Недостаточно данных для выполнения чекина",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("bot_registrations")
        .update({
          checked_in_at: new Date().toISOString(),
          checked_in_by: currentUserId,
          status: 'attended'
        })
        .eq("id", registration.id);

      if (error) throw error;

      toast({
        title: "Чекин выполнен!",
        description: `${registration.bot_users?.first_name || 'Участник'} успешно отмечен(а)`,
      });

      // Сбросить форму
      setRegistration(null);
      setTicketCode("");
      setConfirmDialogOpen(false);

      // Вызвать callback для обновления списка
      onCheckInComplete?.();
    } catch (error) {
      console.error("Error checking in:", error);
      toast({
        title: "Ошибка чекина",
        description: "Не удалось выполнить чекин. Попробуйте еще раз.",
        variant: "destructive",
      });
    }
  };

  const cancelCheckIn = () => {
    setConfirmDialogOpen(false);
    setRegistration(null);
    setTicketCode("");
  };

  return (
    <div className="space-y-6">
      {/* Поиск по коду билета */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Поиск билета
          </CardTitle>
          <CardDescription>
            Введите код билета для проверки и чекина участника
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="ticketCode">Код билета</Label>
              <Input
                id="ticketCode"
                placeholder="MAIN-XXXXX-XXXX"
                value={ticketCode}
                onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                className="font-mono"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleSearch}
                disabled={searching || !ticketCode.trim()}
                className="min-w-[100px]"
              >
                {searching ? "Поиск..." : "Найти"}
              </Button>
            </div>
          </div>

          {/* TODO: Добавить QR-сканер */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <QrCode className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">QR-сканер (в разработке)</p>
                <p className="text-blue-700 mt-1">
                  Для добавления QR-сканера установите библиотеку:
                  <code className="block mt-1 bg-blue-100 px-2 py-1 rounded">
                    npm install html5-qrcode
                  </code>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Информация о билете */}
      {registration && !confirmDialogOpen && (
        <Card className={registration.checked_in_at ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {registration.checked_in_at ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-900">Билет уже отмечен</span>
                </>
              ) : (
                <>
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <span className="text-yellow-900">Информация о билете</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Участник</p>
              <p className="text-lg font-semibold">
                {registration.bot_users?.first_name || registration.bot_users?.username || 'Без имени'}
                {registration.bot_users?.last_name && ` ${registration.bot_users.last_name}`}
              </p>
            </div>

            {registration.bot_users?.phone_number && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Телефон</p>
                <p>{registration.bot_users.phone_number}</p>
              </div>
            )}

            {registration.bot_events && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Событие</p>
                <p className="font-medium">{registration.bot_events.title}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(registration.bot_events.event_date)}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-muted-foreground">Статус</p>
              <Badge variant={registration.checked_in_at ? "outline" : "secondary"}>
                {registration.checked_in_at ? "Посетил(а)" : registration.status}
              </Badge>
            </div>

            {registration.checked_in_at && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Время чекина</p>
                <p>{formatDate(registration.checked_in_at)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Диалог подтверждения чекина */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение чекина</DialogTitle>
            <DialogDescription>
              Подтвердите чекин участника на мероприятие
            </DialogDescription>
          </DialogHeader>

          {registration && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-center p-6 bg-primary/10 rounded-lg">
                <div className="text-center">
                  <CheckCircle className="h-16 w-16 text-primary mx-auto mb-3" />
                  <p className="text-2xl font-bold">
                    {registration.bot_users?.first_name || registration.bot_users?.username || 'Участник'}
                    {registration.bot_users?.last_name && ` ${registration.bot_users.last_name}`}
                  </p>
                  {registration.bot_events && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {registration.bot_events.title}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Код билета:</span>
                  <span className="font-mono font-medium">{registration.ticket_code}</span>
                </div>
                {registration.bot_users?.phone_number && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Телефон:</span>
                    <span className="font-medium">{registration.bot_users.phone_number}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={cancelCheckIn}>
              Отмена
            </Button>
            <Button onClick={confirmCheckIn}>
              Подтвердить чекин
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
