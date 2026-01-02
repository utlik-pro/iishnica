import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Search } from "lucide-react";

interface MiniappLead {
  id: number;
  event_id: number;
  user_id: number;
  ticket_code: string | null;
  status: string;
  notes: string | null;
  registered_at: string;
  confirmed: boolean;
  checked_in_at: string | null;
  bot_users?: {
    id: number;
    username: string | null;
    first_name: string | null;
    last_name: string | null;
    phone_number: string | null;
  } | null;
  bot_events?: {
    id: number;
    title: string;
    event_date: string;
  } | null;
}

const statusLabels: Record<string, string> = {
  registered: "Зарегистрирован",
  confirmed: "Подтвержден",
  cancelled: "Отменен",
  attended: "Посетил",
};

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  registered: "default",
  confirmed: "secondary",
  cancelled: "destructive",
  attended: "outline",
};

export function MiniappLeadsManager() {
  const { toast } = useToast();
  const [leads, setLeads] = useState<MiniappLead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<MiniappLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [eventFilter, setEventFilter] = useState<number | "all">("all");
  const [events, setEvents] = useState<{id: number, title: string}[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [currentLead, setCurrentLead] = useState<MiniappLead | null>(null);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<string>("registered");

  useEffect(() => {
    fetchLeads();
    fetchEvents();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [leads, statusFilter, eventFilter, searchTerm]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
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
        .order("registered_at", { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error("Error fetching miniapp leads:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить лиды из miniapp",
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

  const filterLeads = () => {
    let filtered = [...leads];

    // Фильтр по событию
    if (eventFilter !== "all") {
      filtered = filtered.filter(lead => lead.event_id === eventFilter);
    }

    // Фильтр по статусу
    if (statusFilter !== "all") {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    // Поиск
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(lead => {
        const userName = lead.bot_users?.first_name || lead.bot_users?.username || '';
        const userPhone = lead.bot_users?.phone_number || '';
        const ticketCode = lead.ticket_code || '';

        return userName.toLowerCase().includes(term) ||
               userPhone.toLowerCase().includes(term) ||
               ticketCode.toLowerCase().includes(term) ||
               `#${lead.id}`.includes(term);
      });
    }

    setFilteredLeads(filtered);
  };

  const handleUpdateLead = async () => {
    if (!currentLead) return;

    try {
      const { error } = await supabase
        .from("bot_registrations")
        .update({ notes, status })
        .eq("id", currentLead.id);

      if (error) throw error;

      toast({
        title: "Успешно",
        description: "Регистрация обновлена",
      });

      setOpenDialog(false);
      fetchLeads();
    } catch (error) {
      console.error("Error updating registration:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить регистрацию",
        variant: "destructive",
      });
    }
  };

  const handleCancelRegistration = async (leadId: number) => {
    try {
      const { error } = await supabase
        .from("bot_registrations")
        .update({ status: "cancelled" })
        .eq("id", leadId);

      if (error) throw error;

      toast({
        title: "Отменено",
        description: "Регистрация отменена",
      });

      fetchLeads();
    } catch (error) {
      console.error("Error cancelling registration:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось отменить регистрацию",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (lead: MiniappLead) => {
    setCurrentLead(lead);
    setNotes(lead.notes || "");
    setStatus(lead.status);
    setOpenDialog(true);
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

  if (loading) {
    return <div className="p-4">Загрузка...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Лиды из Telegram Mini-App</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{filteredLeads.length} из {leads.length}</Badge>
        </div>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Поиск по имени, телефону или коду билета..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={eventFilter.toString()} onValueChange={(v) => setEventFilter(v === "all" ? "all" : parseInt(v))}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Фильтр по событию" />
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

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Фильтр по статусу" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="registered">Зарегистрированы</SelectItem>
            <SelectItem value="confirmed">Подтверждены</SelectItem>
            <SelectItem value="cancelled">Отменены</SelectItem>
            <SelectItem value="attended">Посетили</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>№</TableHead>
              <TableHead>Имя</TableHead>
              <TableHead>Телефон</TableHead>
              <TableHead>Код билета</TableHead>
              <TableHead>Событие</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  {searchTerm || statusFilter !== "all"
                    ? "Регистрации не найдены"
                    : "Пока нет регистраций из miniapp"}
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => (
                <TableRow key={lead.id} className={lead.status === "cancelled" ? "opacity-50" : ""}>
                  <TableCell className="font-medium">#{lead.id}</TableCell>
                  <TableCell className="font-medium">
                    {lead.bot_users?.first_name || lead.bot_users?.username || "—"}
                    {lead.bot_users?.last_name && ` ${lead.bot_users.last_name}`}
                  </TableCell>
                  <TableCell>{lead.bot_users?.phone_number || "—"}</TableCell>
                  <TableCell>
                    {lead.ticket_code ? (
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                        {lead.ticket_code}
                      </code>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {lead.bot_events ? (
                      <div className="text-sm">
                        <div className="font-medium">{lead.bot_events.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(lead.bot_events.event_date).toLocaleDateString("ru-RU", {
                            day: "2-digit",
                            month: "long",
                          })}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Не указано</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[lead.status] || "default"}>
                      {statusLabels[lead.status] || lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(lead.registered_at)}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(lead)}
                    >
                      Редактировать
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактирование регистрации</DialogTitle>
            <DialogDescription>
              Билет #{currentLead?.id}
              {currentLead?.bot_users && (
                <> • {currentLead.bot_users.first_name || currentLead.bot_users.username}</>
              )}
              {currentLead?.ticket_code && (
                <> • <code className="text-xs">{currentLead.ticket_code}</code></>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Статус</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="registered">Зарегистрирован</SelectItem>
                  <SelectItem value="confirmed">Подтвержден</SelectItem>
                  <SelectItem value="cancelled">Отменен</SelectItem>
                  <SelectItem value="attended">Посетил</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Заметки</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Добавьте заметки о лиде..."
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Отмена
              </Button>
              <Button onClick={handleUpdateLead}>
                Сохранить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
